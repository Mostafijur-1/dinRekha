import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser, restoreDailyActivity, revalidatePath, writeLog } =
  vi.hoisted(() => ({
    getCurrentUser: vi.fn(),
    restoreDailyActivity: vi.fn(),
    revalidatePath: vi.fn(),
    writeLog: vi.fn(),
  }));

vi.mock("@/lib/auth", () => ({ getCurrentUser }));
vi.mock("@/features/daily-activities/repository", () => ({
  restoreDailyActivity,
}));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/observability/logger", () => ({
  requestId: vi.fn(() => "request-1"),
  writeLog,
}));

import { POST } from "@/app/api/settings/activities/restore/route";

function request(activityId: string, origin = "https://dinrekha.test") {
  return new Request("https://dinrekha.test/api/settings/activities/restore", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify({ activityId }),
  });
}

describe("Activity restore route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects cross-origin and unauthenticated requests", async () => {
    const activityId = new ObjectId().toHexString();
    await expect(
      POST(request(activityId, "https://attacker.test")),
    ).resolves.toMatchObject({ status: 403 });
    getCurrentUser.mockResolvedValue(null);
    await expect(POST(request(activityId))).resolves.toMatchObject({
      status: 401,
    });
    expect(restoreDailyActivity).not.toHaveBeenCalled();
  });

  it("restores for the authenticated owner and returns an explicit response", async () => {
    const ownerId = new ObjectId().toHexString();
    const activityId = new ObjectId().toHexString();
    getCurrentUser.mockResolvedValue({ id: ownerId });
    restoreDailyActivity.mockResolvedValue(true);

    const response = await POST(request(activityId));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      message: "Activity Restore হয়েছে।",
    });
    expect(restoreDailyActivity).toHaveBeenCalledWith(ownerId, activityId);
    expect(revalidatePath).toHaveBeenCalledWith("/settings");
  });

  it("returns a safe response and logs when persistence throws", async () => {
    getCurrentUser.mockResolvedValue({ id: new ObjectId().toHexString() });
    restoreDailyActivity.mockRejectedValue(new Error("mongodb://secret"));

    const response = await POST(request(new ObjectId().toHexString()));

    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("secret");
    expect(writeLog).toHaveBeenCalledWith(
      "error",
      expect.objectContaining({ event: "api_failure", status: 500 }),
    );
  });
});
