import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  activityFindOne,
  activityUpdateOne,
  progressUpdateOne,
  activityBulkWrite,
  activityFind,
  activitySort,
  activityToArray,
} = vi.hoisted(() => ({
  activityFindOne: vi.fn(),
  activityUpdateOne: vi.fn(),
  progressUpdateOne: vi.fn(),
  activityBulkWrite: vi.fn(),
  activityFind: vi.fn(),
  activitySort: vi.fn(),
  activityToArray: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
  dailyActivitiesCollection: vi.fn(async () => ({
    findOne: activityFindOne,
    updateOne: activityUpdateOne,
    bulkWrite: activityBulkWrite,
    find: activityFind,
  })),
  dailyActivityProgressCollection: vi.fn(async () => ({
    updateOne: progressUpdateOne,
  })),
}));
vi.mock("@/lib/db/indexes", () => ({ ensureDatabaseIndexes: vi.fn() }));

import {
  archiveDailyActivity,
  listArchivedDailyActivities,
  reorderDailyActivity,
  restoreDailyActivity,
  setDailyProgress,
  updateDailyActivity,
} from "@/features/daily-activities/repository";

describe("Daily Activity repository authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    activityFind.mockReturnValue({ sort: activitySort });
    activitySort.mockReturnValue({ toArray: activityToArray });
    activityToArray.mockResolvedValue([]);
  });

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

  it("lists and restores only the authenticated owner's archived activities", async () => {
    const ownerId = new ObjectId();
    const activityId = new ObjectId();
    activityToArray.mockResolvedValue([
      {
        _id: activityId,
        name: "পড়া",
        category: "শেখা",
      },
    ]);
    activityUpdateOne.mockResolvedValue({ matchedCount: 1 });

    await expect(
      listArchivedDailyActivities(ownerId.toHexString()),
    ).resolves.toEqual([
      { id: activityId.toHexString(), name: "পড়া", category: "শেখা" },
    ]);
    await expect(
      restoreDailyActivity(ownerId.toHexString(), activityId.toHexString()),
    ).resolves.toBe(true);

    expect(activityFind).toHaveBeenCalledWith({
      ownerId,
      status: "archived",
    });
    expect(activityUpdateOne).toHaveBeenCalledWith(
      { _id: activityId, ownerId, status: "archived" },
      {
        $set: {
          status: "active",
          sortOrder: expect.any(Number),
          updatedAt: expect.any(Date),
        },
        $unset: { archivedAt: "" },
      },
    );
  });
});
