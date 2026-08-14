import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getCurrentUser,
  createDailyActivity,
  setDailyProgress,
  restoreDailyActivity,
} = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  createDailyActivity: vi.fn(),
  setDailyProgress: vi.fn(),
  restoreDailyActivity: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getCurrentUser }));
vi.mock("@/features/daily-activities/repository", () => ({
  createDailyActivity,
  setDailyProgress,
  updateDailyActivity: vi.fn(),
  archiveDailyActivity: vi.fn(),
  restoreDailyActivity,
}));

import {
  createActivityAction,
  restoreActivityAction,
  setProgressAction,
} from "@/features/daily-activities/actions";
import { initialActivityActionState } from "@/features/daily-activities/action-state";

describe("Daily Activity Server Action authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUser.mockResolvedValue(null);
  });

  it("rejects creation without an authenticated session", async () => {
    const result = await createActivityAction(
      initialActivityActionState,
      new FormData(),
    );
    expect(result.status).toBe("error");
    expect(createDailyActivity).not.toHaveBeenCalled();
  });

  it("rejects progress mutation without an authenticated session", async () => {
    const data = new FormData();
    data.set("value", "1");
    data.set("dateKey", "2026-08-13");
    await setProgressAction(new ObjectId().toHexString(), data);
    expect(setDailyProgress).not.toHaveBeenCalled();
  });

  it("rejects a future progress date instead of writing it to today", async () => {
    getCurrentUser.mockResolvedValue({
      id: new ObjectId().toHexString(),
      timezone: "Asia/Dhaka",
    });
    const data = new FormData();
    data.set("value", "1");
    data.set("dateKey", "2999-01-01");
    await setProgressAction(new ObjectId().toHexString(), data);
    expect(setDailyProgress).not.toHaveBeenCalled();
  });

  it("restores an archived activity only for an authenticated user", async () => {
    const activityId = new ObjectId().toHexString();
    await restoreActivityAction(activityId);
    expect(restoreDailyActivity).not.toHaveBeenCalled();

    const userId = new ObjectId().toHexString();
    getCurrentUser.mockResolvedValue({ id: userId, timezone: "Asia/Dhaka" });
    await restoreActivityAction(activityId);
    expect(restoreDailyActivity).toHaveBeenCalledWith(userId, activityId);
  });
});
