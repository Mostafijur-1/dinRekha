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
  it("defaults to sharing everything for an active connection", async () => {
    connectionFindOne.mockResolvedValue({ _id: new ObjectId() });
    policyFindOne.mockResolvedValue(null);
    const owner = new ObjectId().toHexString();
    const viewer = new ObjectId().toHexString();
    await expect(getSharingPolicy(owner, viewer)).resolves.toEqual({
      productivitySummary: true,
      streaks: true,
      dailyActivities: true,
      timeline: true,
    });
    await expect(authorizeSharedReport(owner, viewer)).resolves.toEqual({
      productivitySummary: true,
      streaks: true,
      dailyActivities: true,
      timeline: true,
    });
  });
  it("rejects permission updates without an active connection", async () => {
    connectionFindOne.mockResolvedValue(null);
    await expect(
      setSharingPolicy(
        new ObjectId().toHexString(),
        new ObjectId().toHexString(),
        {
          productivitySummary: true,
          streaks: true,
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
      productivitySummary: false,
      streaks: false,
      dailyActivities: false,
      timeline: false,
    });
    await expect(authorizeSharedReport(owner, viewer)).resolves.toBeNull();
  });

  it("treats missing new fields in a legacy policy as shared", async () => {
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
      productivitySummary: true,
      streaks: false,
      dailyActivities: true,
      timeline: true,
    });
  });
  it("stores the exact owner to recipient direction", async () => {
    const connectionId = new ObjectId();
    const owner = new ObjectId();
    const recipient = new ObjectId();
    connectionFindOne.mockResolvedValue({ _id: connectionId });
    updateOne.mockResolvedValue({ matchedCount: 1 });
    await setSharingPolicy(owner.toHexString(), recipient.toHexString(), {
      productivitySummary: true,
      streaks: false,
      dailyActivities: false,
      timeline: true,
    });
    expect(updateOne).toHaveBeenCalledWith(
      { connectionId, ownerId: owner, recipientId: recipient },
      expect.objectContaining({
        $set: expect.objectContaining({
          productivitySummary: true,
          streaks: false,
          dailyActivities: false,
          timeline: true,
        }),
      }),
      { upsert: true },
    );
  });
});
