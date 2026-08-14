import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { activitiesFind, activityFindOne, progressFind, timelineFind, toArray } =
  vi.hoisted(() => ({
    activitiesFind: vi.fn(),
    activityFindOne: vi.fn(),
    progressFind: vi.fn(),
    timelineFind: vi.fn(),
    toArray: vi.fn(async () => []),
  }));
vi.mock("@/lib/db/collections", () => ({
  dailyActivitiesCollection: vi.fn(async () => ({
    find: activitiesFind,
    findOne: activityFindOne,
  })),
  dailyActivityProgressCollection: vi.fn(async () => ({ find: progressFind })),
  timelineEntriesCollection: vi.fn(async () => ({ find: timelineFind })),
}));
vi.mock("@/lib/db/indexes", () => ({ ensureDatabaseIndexes: vi.fn() }));

import {
  getActivityHistory,
  getProductivityReport,
} from "@/features/reports/repository";

describe("reports repository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not query progress when an owned activity is not found", async () => {
    const ownerId = new ObjectId();
    const activityId = new ObjectId();
    activityFindOne.mockResolvedValue(null);

    await expect(
      getActivityHistory(
        ownerId.toHexString(),
        activityId.toHexString(),
        ["2026-07-14", "2026-08-13"],
        "2026-08-13",
      ),
    ).resolves.toBeNull();
    expect(activityFindOne).toHaveBeenCalledWith({ _id: activityId, ownerId });
    expect(progressFind).not.toHaveBeenCalled();
  });

  it("scopes every report query to its authenticated owner", async () => {
    activitiesFind.mockReturnValue({ toArray });
    progressFind.mockReturnValue({ toArray });
    timelineFind.mockReturnValue({ toArray });
    const ownerId = new ObjectId();
    await getProductivityReport(
      ownerId.toHexString(),
      ["2026-08-07", "2026-08-13"],
      "2026-08-13",
      600,
      ["2026-07-14", "2026-08-13"],
    );
    expect(activitiesFind).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId }),
    );
    expect(progressFind).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId,
        dateKey: { $gte: "2026-07-14", $lte: "2026-08-13" },
      }),
    );
    expect(timelineFind).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId,
        dateKey: { $gte: "2026-08-07", $lte: "2026-08-13" },
      }),
    );
  });

  it("skips timeline storage when a shared report does not permit it", async () => {
    activitiesFind.mockReturnValue({ toArray });
    progressFind.mockReturnValue({ toArray });
    const ownerId = new ObjectId();

    await getProductivityReport(
      ownerId.toHexString(),
      ["2026-08-07", "2026-08-13"],
      "2026-08-13",
      600,
      ["2026-07-14", "2026-08-13"],
      { includeTimeline: false },
    );

    expect(timelineFind).not.toHaveBeenCalled();
  });

  it("skips activity storage when a shared report does not permit it", async () => {
    timelineFind.mockReturnValue({ toArray });
    const ownerId = new ObjectId();

    await getProductivityReport(
      ownerId.toHexString(),
      ["2026-08-07", "2026-08-13"],
      "2026-08-13",
      600,
      ["2026-07-14", "2026-08-13"],
      { includeActivities: false },
    );

    expect(activitiesFind).not.toHaveBeenCalled();
    expect(progressFind).not.toHaveBeenCalled();
  });
});
