import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser, createTimelineEntry, updateTimelineActivity } =
  vi.hoisted(() => ({
    getCurrentUser: vi.fn(),
    createTimelineEntry: vi.fn(),
    updateTimelineActivity: vi.fn(),
  }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getCurrentUser }));
vi.mock("@/features/timeline/repository", () => ({
  createTimelineEntry,
  updateTimelineActivity,
  deleteTimelineEntry: vi.fn(),
}));

import { initialTimelineActionState } from "@/features/timeline/action-state";
import {
  createTimelineEntryAction,
  updateTimelineEntryAction,
} from "@/features/timeline/actions";

function data(dateKey: string, startTime: string, endTime = "") {
  const formData = new FormData();
  formData.set("dateKey", dateKey);
  formData.set("activity", "পড়াশোনা");
  formData.set("category", "কাজ");
  formData.set("startTime", startTime);
  formData.set("endTime", endTime);
  formData.set("note", "");
  return formData;
}

describe("Timeline Server Action boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUser.mockResolvedValue(null);
    createTimelineEntry.mockResolvedValue("success");
    updateTimelineActivity.mockResolvedValue("success");
  });

  it("rejects creation without an authenticated session", async () => {
    const result = await createTimelineEntryAction(
      initialTimelineActionState,
      data("2026-08-13", "09:00", "10:00"),
    );
    expect(result.status).toBe("error");
    expect(createTimelineEntry).not.toHaveBeenCalled();
  });

  it("rejects a future date", async () => {
    getCurrentUser.mockResolvedValue({
      id: new ObjectId().toHexString(),
      timezone: "Asia/Dhaka",
    });
    const result = await createTimelineEntryAction(
      initialTimelineActionState,
      data("2999-01-01", "09:00", "10:00"),
    );
    expect(result.status).toBe("error");
    expect(createTimelineEntry).not.toHaveBeenCalled();
  });

  it("requires an end time for a historical day", async () => {
    getCurrentUser.mockResolvedValue({
      id: new ObjectId().toHexString(),
      timezone: "Asia/Dhaka",
    });
    const result = await createTimelineEntryAction(
      initialTimelineActionState,
      data("2020-01-01", "09:00"),
    );
    expect(result).toEqual({
      status: "error",
      message: "আগের দিনের entry-তে শেষের সময় দিতে হবে।",
    });
    expect(createTimelineEntry).not.toHaveBeenCalled();
  });

  it("rejects creation during the reserved sleep period", async () => {
    getCurrentUser.mockResolvedValue({
      id: new ObjectId().toHexString(),
      timezone: "Asia/Dhaka",
    });

    const result = await createTimelineEntryAction(
      initialTimelineActionState,
      data("2020-01-01", "04:00", "05:00"),
    );

    expect(result).toEqual({
      status: "error",
      message: "০০:০০–০৫:০০ সময়টি ঘুমের জন্য নির্ধারিত।",
    });
    expect(createTimelineEntry).not.toHaveBeenCalled();
  });

  it("updates only the activity and ignores other submitted entry fields", async () => {
    const userId = new ObjectId().toHexString();
    const entryId = new ObjectId().toHexString();
    getCurrentUser.mockResolvedValue({
      id: userId,
      timezone: "Asia/Dhaka",
    });
    const formData = data("2026-08-13", "06:00", "22:00");
    formData.set("activity", "পরিবর্তিত কাজ");
    formData.set("category", "পরিবর্তিত বিভাগ");
    formData.set("note", "পরিবর্তিত note");

    const result = await updateTimelineEntryAction(
      entryId,
      initialTimelineActionState,
      formData,
    );

    expect(result.status).toBe("success");
    expect(updateTimelineActivity).toHaveBeenCalledWith(
      userId,
      entryId,
      "2026-08-13",
      "পরিবর্তিত কাজ",
    );
  });
});
