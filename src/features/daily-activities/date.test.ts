import { describe, expect, it } from "vitest";

import {
  allowedDateKey,
  dateKeyForTimezone,
  shiftDateKey,
  weekdayForDateKey,
} from "@/features/daily-activities/date";

describe("Daily Activity date boundary", () => {
  it("uses the user's timezone rather than the server date", () => {
    const lateUtc = new Date("2026-08-13T20:30:00.000Z");
    expect(dateKeyForTimezone(lateUtc, "Asia/Dhaka")).toBe("2026-08-14");
    expect(dateKeyForTimezone(lateUtc, "UTC")).toBe("2026-08-13");
  });

  it("navigates valid calendar dates and rejects future selection", () => {
    expect(shiftDateKey("2026-03-01", -1)).toBe("2026-02-28");
    expect(weekdayForDateKey("2026-08-17")).toBe(1);
    expect(allowedDateKey("2026-08-14", "2026-08-13")).toBe("2026-08-13");
    expect(allowedDateKey("not-a-date", "2026-08-13")).toBe("2026-08-13");
  });
});
