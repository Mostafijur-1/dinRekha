import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser, createTimelineEntry } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  createTimelineEntry: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getCurrentUser }));
vi.mock("@/features/timeline/repository", () => ({
  createTimelineEntry,
  updateTimelineEntry: vi.fn(),
  deleteTimelineEntry: vi.fn(),
}));

import { initialTimelineActionState } from "@/features/timeline/action-state";
import { createTimelineEntryAction } from "@/features/timeline/actions";

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
});
