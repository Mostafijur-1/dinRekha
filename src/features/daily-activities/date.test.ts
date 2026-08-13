import { describe, expect, it } from "vitest";

import { dateKeyForTimezone } from "@/features/daily-activities/date";

describe("Daily Activity date boundary", () => {
  it("uses the user's timezone rather than the server date", () => {
    const lateUtc = new Date("2026-08-13T20:30:00.000Z");
    expect(dateKeyForTimezone(lateUtc, "Asia/Dhaka")).toBe("2026-08-14");
    expect(dateKeyForTimezone(lateUtc, "UTC")).toBe("2026-08-13");
  });
});
