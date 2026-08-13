import { ObjectId } from "mongodb";
import { describe, expect, it, vi } from "vitest";

const { activitiesFind, progressFind, timelineFind, toArray } = vi.hoisted(
  () => ({
    activitiesFind: vi.fn(),
    progressFind: vi.fn(),
    timelineFind: vi.fn(),
    toArray: vi.fn(async () => []),
  }),
);
const cursor = { sort: vi.fn(() => ({ toArray })) };
vi.mock("@/lib/db/collections", () => ({
  dailyActivitiesCollection: vi.fn(async () => ({ find: activitiesFind })),
  dailyActivityProgressCollection: vi.fn(async () => ({ find: progressFind })),
  timelineEntriesCollection: vi.fn(async () => ({ find: timelineFind })),
}));

import { buildAccountExport } from "@/features/account/export-repository";

describe("account export", () => {
  it("scopes every collection to the current owner and exposes no internal identity fields", async () => {
    activitiesFind.mockReturnValue(cursor);
    progressFind.mockReturnValue(cursor);
    timelineFind.mockReturnValue(cursor);
    const owner = new ObjectId();
    const result = await buildAccountExport({
      id: owner.toHexString(),
      name: "নাম",
      email: "user@example.com",
      timezone: "Asia/Dhaka",
      reminders: {
        activity: true,
        endOfDay: false,
        dailySummary: false,
        streak: false,
        endOfDayTime: "21:30",
        dailySummaryTime: "22:00",
      },
    });
    expect(activitiesFind).toHaveBeenCalledWith({ ownerId: owner });
    expect(progressFind).toHaveBeenCalledWith({ ownerId: owner });
    expect(timelineFind).toHaveBeenCalledWith({ ownerId: owner });
    expect(result?.profile).toEqual({
      name: "নাম",
      email: "user@example.com",
      timezone: "Asia/Dhaka",
      reminders: expect.objectContaining({ activity: true }),
    });
    expect(result).not.toHaveProperty("pushSubscriptions");
    expect(result).not.toHaveProperty("sessionVersion");
  });
});
