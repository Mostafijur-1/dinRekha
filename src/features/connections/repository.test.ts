import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  countDocuments,
  insertOne,
  findOne,
  findOneAndUpdate,
  updateOne,
  deleteMany,
} = vi.hoisted(() => ({
  countDocuments: vi.fn(),
  insertOne: vi.fn(),
  findOne: vi.fn(),
  findOneAndUpdate: vi.fn(),
  updateOne: vi.fn(),
  deleteMany: vi.fn(),
}));
vi.mock("@/lib/db/collections", () => ({
  connectionInvitationsCollection: vi.fn(async () => ({
    countDocuments,
    insertOne,
    findOne,
    findOneAndUpdate,
  })),
  connectionsCollection: vi.fn(async () => ({ updateOne })),
  sharingPoliciesCollection: vi.fn(async () => ({ deleteMany })),
  usersCollection: vi.fn(async () => ({ findOne })),
}));
vi.mock("@/lib/db/indexes", () => ({ ensureDatabaseIndexes: vi.fn() }));

import {
  createConnectionInvite,
  disconnectConnection,
  redeemConnectionInvite,
} from "@/features/connections/repository";

describe("connection invitation security", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stores only a hash and rate-limits active invites", async () => {
    countDocuments.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
    insertOne.mockResolvedValue({ acknowledged: true });
    const owner = new ObjectId();
    const result = await createConnectionInvite(owner.toHexString());
    expect(result.status).toBe("success");
    expect(insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        inviterId: owner,
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    );
    expect(insertOne.mock.calls[0]?.[0].tokenHash).not.toBe(
      result.status === "success" ? result.token : "",
    );
  });

  it("consumes an invite atomically before creating a connection", async () => {
    const inviterId = new ObjectId();
    const recipientId = new ObjectId();
    findOneAndUpdate.mockResolvedValue({ inviterId });
    updateOne.mockResolvedValue({ matchedCount: 1 });
    await expect(
      redeemConnectionInvite("a".repeat(24), recipientId.toHexString()),
    ).resolves.toBe(true);
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "active",
        inviterId: { $ne: recipientId },
      }),
      expect.objectContaining({
        $set: expect.objectContaining({
          status: "used",
          usedById: recipientId,
        }),
      }),
      { returnDocument: "after" },
    );
  });

  it("allows disconnect only for a member of the connection", async () => {
    const owner = new ObjectId();
    const connection = new ObjectId();
    updateOne.mockResolvedValue({ matchedCount: 1 });
    await disconnectConnection(owner.toHexString(), connection.toHexString());
    expect(updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: connection,
        $or: [{ userLowId: owner }, { userHighId: owner }],
      }),
      expect.anything(),
    );
    expect(deleteMany).toHaveBeenCalledWith({ connectionId: connection });
  });
});
