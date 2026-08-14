import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { findOne, insertOne, updateOne, deleteOne, aggregate, toArray } =
  vi.hoisted(() => ({
    findOne: vi.fn(),
    insertOne: vi.fn(),
    updateOne: vi.fn(),
    deleteOne: vi.fn(),
    aggregate: vi.fn(),
    toArray: vi.fn(),
  }));

vi.mock("@/lib/db/collections", () => ({
  timelineEntriesCollection: vi.fn(async () => ({
    findOne,
    insertOne,
    updateOne,
    deleteOne,
    aggregate,
  })),
}));
vi.mock("@/lib/db/indexes", () => ({ ensureDatabaseIndexes: vi.fn() }));

import {
  createTimelineEntry,
  deleteTimelineEntry,
  listTimelineSuggestions,
  updateTimelineActivity,
} from "@/features/timeline/repository";

const input = {
  activity: "পড়াশোনা",
  category: "কাজ",
  startTime: "09:00",
  endTime: "10:00",
  note: "",
};

describe("Timeline repository authorization and overlap", () => {
  beforeEach(() => vi.clearAllMocks());

  it("scopes suggestion history to the authenticated owner", async () => {
    const ownerId = new ObjectId();
    toArray.mockResolvedValue([]);
    aggregate.mockReturnValue({ toArray });

    await listTimelineSuggestions(ownerId.toHexString(), "2026-08-13", 600);

    expect(aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        { $match: { ownerId, startMinute: { $gte: 300 } } },
      ]),
    );
    expect(aggregate.mock.calls[0][0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          $group: expect.objectContaining({
            typicalStartMinute: { $avg: "$startMinute" },
          }),
        }),
      ]),
    );
  });

  it("does not insert an overlapping interval", async () => {
    findOne.mockResolvedValue({ _id: new ObjectId() });
    await expect(
      createTimelineEntry(new ObjectId().toHexString(), "2026-08-13", input),
    ).resolves.toBe("overlap");
    expect(insertOne).not.toHaveBeenCalled();
  });

  it("updates only the activity within the owner and date boundary", async () => {
    const ownerId = new ObjectId();
    const entryId = new ObjectId();
    updateOne.mockResolvedValueOnce({ matchedCount: 0 });
    await expect(
      updateTimelineActivity(
        ownerId.toHexString(),
        entryId.toHexString(),
        "2026-08-13",
        "নতুন কাজ",
      ),
    ).resolves.toBe("not_found");
    expect(updateOne).toHaveBeenCalledWith(
      { _id: entryId, ownerId, dateKey: "2026-08-13" },
      {
        $set: {
          activity: "নতুন কাজ",
          updatedAt: expect.any(Date),
        },
      },
    );
  });

  it("scopes deletion to the authenticated owner", async () => {
    const ownerId = new ObjectId();
    const entryId = new ObjectId();
    deleteOne.mockResolvedValue({ deletedCount: 0 });
    await expect(
      deleteTimelineEntry(ownerId.toHexString(), entryId.toHexString()),
    ).resolves.toBe(false);
    expect(deleteOne).toHaveBeenCalledWith({ _id: entryId, ownerId });
  });
});
