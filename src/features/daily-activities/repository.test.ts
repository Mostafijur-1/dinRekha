import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  activityFindOne,
  activityUpdateOne,
  progressUpdateOne,
  activityBulkWrite,
} = vi.hoisted(() => ({
  activityFindOne: vi.fn(),
  activityUpdateOne: vi.fn(),
  progressUpdateOne: vi.fn(),
  activityBulkWrite: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
  dailyActivitiesCollection: vi.fn(async () => ({
    findOne: activityFindOne,
    updateOne: activityUpdateOne,
    bulkWrite: activityBulkWrite,
  })),
  dailyActivityProgressCollection: vi.fn(async () => ({
    updateOne: progressUpdateOne,
  })),
}));
vi.mock("@/lib/db/indexes", () => ({ ensureDatabaseIndexes: vi.fn() }));

import {
  archiveDailyActivity,
  reorderDailyActivity,
  setDailyProgress,
  updateDailyActivity,
} from "@/features/daily-activities/repository";

describe("Daily Activity repository authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("scopes archive and edit mutations to the authenticated owner", async () => {
    const ownerId = new ObjectId();
    const activityId = new ObjectId();
    activityFindOne.mockResolvedValue({ measurement: "boolean" });
    activityUpdateOne.mockResolvedValue({ matchedCount: 1 });

    await archiveDailyActivity(ownerId.toHexString(), activityId.toHexString());
    await updateDailyActivity(ownerId.toHexString(), activityId.toHexString(), {
      name: "পড়া",
      description: "",
      category: "পড়াশোনা",
      measurement: "boolean",
      target: 1,
      unit: "",
      frequency: "daily",
      days: [],
    });

    expect(activityUpdateOne).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ _id: activityId, ownerId, status: "active" }),
      expect.anything(),
    );
    expect(activityUpdateOne).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ _id: activityId, ownerId, status: "active" }),
      expect.anything(),
    );
  });

  it("does not write progress when the activity is not owned by the caller", async () => {
    activityFindOne.mockResolvedValue(null);
    const result = await setDailyProgress(
      new ObjectId().toHexString(),
      new ObjectId().toHexString(),
      "2026-08-13",
      1,
    );
    expect(result).toBe(false);
    expect(progressUpdateOne).not.toHaveBeenCalled();
  });

  it("does not reorder when the activity is not owned by the caller", async () => {
    activityFindOne.mockResolvedValue(null);
    await expect(
      reorderDailyActivity(
        new ObjectId().toHexString(),
        new ObjectId().toHexString(),
        "up",
        "2026-08-17",
      ),
    ).resolves.toBe(false);
    expect(activityBulkWrite).not.toHaveBeenCalled();
  });
});
