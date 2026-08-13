import { describe, expect, it } from "vitest";

import {
  currentMinuteForTimezone,
  durationLabel,
  minuteToTime,
  timelineGaps,
  timeToMinute,
} from "@/features/timeline/time";

describe("Timeline time utilities", () => {
  it("converts time and duration labels", () => {
    expect(timeToMinute("08:35")).toBe(515);
    expect(minuteToTime(515)).toBe("08:35");
    expect(durationLabel(135)).toBe("2 ঘণ্টা 15 মিনিট");
  });

  it("calculates untracked gaps between sorted entries", () => {
    expect(
      timelineGaps(
        [
          { startMinute: 60, endMinute: 120 },
          { startMinute: 180, endMinute: 240 },
        ],
        300,
      ),
    ).toEqual([
      { startMinute: 0, endMinute: 60 },
      { startMinute: 120, endMinute: 180 },
      { startMinute: 240, endMinute: 300 },
    ]);
  });

  it("treats an in-progress entry as occupied through the boundary", () => {
    expect(
      timelineGaps([{ startMinute: 120, endMinute: undefined }], 300),
    ).toEqual([{ startMinute: 0, endMinute: 120 }]);
  });

  it("uses the user's timezone for the current minute", () => {
    expect(
      currentMinuteForTimezone(
        new Date("2026-08-13T04:30:00.000Z"),
        "Asia/Dhaka",
      ),
    ).toBe(630);
  });
});
