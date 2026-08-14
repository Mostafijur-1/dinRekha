import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { connectionFindOne, policyFindOne, updateOne } = vi.hoisted(() => ({
  connectionFindOne: vi.fn(),
  policyFindOne: vi.fn(),
  updateOne: vi.fn(),
}));
vi.mock("@/lib/db/collections", () => ({
  connectionsCollection: vi.fn(async () => ({ findOne: connectionFindOne })),
  sharingPoliciesCollection: vi.fn(async () => ({
    findOne: policyFindOne,
    updateOne,
  })),
}));
vi.mock("@/lib/db/indexes", () => ({ ensureDatabaseIndexes: vi.fn() }));
import {
  authorizeSharedReport,
  getSharingPolicy,
  setSharingPolicy,
} from "@/features/sharing/repository";

describe("directional sharing authorization", () => {
  beforeEach(() => vi.clearAllMocks());
  it("shares today's activities but keeps timeline private by default", async () => {
    connectionFindOne.mockResolvedValue({ _id: new ObjectId() });
    policyFindOne.mockResolvedValue(null);
    const owner = new ObjectId().toHexString();
    const viewer = new ObjectId().toHexString();
    await expect(getSharingPolicy(owner, viewer)).resolves.toEqual({
      dailyActivities: true,
      timeline: false,
    });
    await expect(authorizeSharedReport(owner, viewer)).resolves.toEqual({
      dailyActivities: true,
      timeline: false,
    });
  });
  it("rejects permission updates without an active connection", async () => {
    connectionFindOne.mockResolvedValue(null);
    await expect(
      setSharingPolicy(
        new ObjectId().toHexString(),
        new ObjectId().toHexString(),
        {
          dailyActivities: true,
          timeline: true,
        },
      ),
    ).resolves.toBe(false);
    expect(updateOne).not.toHaveBeenCalled();
  });
  it("keeps everything private without an active connection", async () => {
    connectionFindOne.mockResolvedValue(null);
    const owner = new ObjectId().toHexString();
    const viewer = new ObjectId().toHexString();

    await expect(getSharingPolicy(owner, viewer)).resolves.toEqual({
      dailyActivities: false,
      timeline: false,
    });
    await expect(authorizeSharedReport(owner, viewer)).resolves.toBeNull();
  });

  it("keeps a missing legacy timeline permission private", async () => {
    connectionFindOne.mockResolvedValue({ _id: new ObjectId() });
    policyFindOne.mockResolvedValue({
      productivitySummary: true,
      streaks: false,
    });

    await expect(
      getSharingPolicy(
        new ObjectId().toHexString(),
        new ObjectId().toHexString(),
      ),
    ).resolves.toEqual({
      dailyActivities: true,
      timeline: false,
    });
  });
  it("stores the exact owner to recipient direction", async () => {
    const connectionId = new ObjectId();
    const owner = new ObjectId();
    const recipient = new ObjectId();
    connectionFindOne.mockResolvedValue({ _id: connectionId });
    updateOne.mockResolvedValue({ matchedCount: 1 });
    await setSharingPolicy(owner.toHexString(), recipient.toHexString(), {
      dailyActivities: false,
      timeline: true,
    });
    expect(updateOne).toHaveBeenCalledWith(
      { connectionId, ownerId: owner, recipientId: recipient },
      expect.objectContaining({
        $set: expect.objectContaining({
          dailyActivities: false,
          timeline: true,
        }),
      }),
      { upsert: true },
    );
  });
});
