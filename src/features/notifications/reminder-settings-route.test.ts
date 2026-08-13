import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser, updateReminderSettings, revalidatePath, writeLog } =
  vi.hoisted(() => ({
    getCurrentUser: vi.fn(),
    updateReminderSettings: vi.fn(),
    revalidatePath: vi.fn(),
    writeLog: vi.fn(),
  }));

vi.mock("@/lib/auth", () => ({ getCurrentUser }));
vi.mock("@/features/auth/repositories/user-repository", () => ({
  updateReminderSettings,
}));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/observability/logger", () => ({
  requestId: vi.fn(() => "request-1"),
  writeLog,
}));

import { POST } from "@/app/api/settings/reminders/route";

function request(body: object, origin = "https://dinrekha.test") {
  return new Request("https://dinrekha.test/api/settings/reminders", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const settings = {
  activity: true,
  endOfDay: true,
  dailySummary: false,
  streak: false,
  endOfDayTime: "21:30",
  dailySummaryTime: "22:00",
};

describe("reminder settings route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects cross-origin and unauthenticated requests", async () => {
    await expect(
      POST(request(settings, "https://attacker.test")),
    ).resolves.toMatchObject({
      status: 403,
    });
    getCurrentUser.mockResolvedValue(null);
    await expect(POST(request(settings))).resolves.toMatchObject({
      status: 401,
    });
    expect(updateReminderSettings).not.toHaveBeenCalled();
  });

  it("saves validated settings for the authenticated owner", async () => {
    getCurrentUser.mockResolvedValue({
      id: "owner",
      reminders: { endOfDayTime: "20:45", dailySummaryTime: "22:15" },
    });
    updateReminderSettings.mockResolvedValue(true);

    const response = await POST(
      request({ ...settings, endOfDayTime: "", dailySummaryTime: "" }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(updateReminderSettings).toHaveBeenCalledWith("owner", {
      ...settings,
      endOfDayTime: "20:45",
      dailySummaryTime: "22:15",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/settings");
  });

  it("returns a safe error response when persistence throws", async () => {
    getCurrentUser.mockResolvedValue({
      id: "owner",
      reminders: { endOfDayTime: "21:30", dailySummaryTime: "22:00" },
    });
    updateReminderSettings.mockRejectedValue(new Error("mongodb://secret"));

    const response = await POST(request(settings));
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("secret");
    expect(writeLog).toHaveBeenCalledWith(
      "error",
      expect.objectContaining({ event: "api_failure", status: 500 }),
    );
  });
});
