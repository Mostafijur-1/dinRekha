import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/notifications/dispatcher", () => ({
  dispatchDueNotifications: vi.fn(),
}));
import { GET } from "@/app/api/cron/notifications/route";

describe("notification cron route", () => {
  it("rejects requests when CRON_SECRET is absent", async () => {
    const previous = process.env.CRON_SECRET;
    delete process.env.CRON_SECRET;
    const response = await GET(
      new Request("https://dinrekha.test/api/cron/notifications"),
    );
    expect(response.status).toBe(401);
    if (previous) process.env.CRON_SECRET = previous;
  });
});
