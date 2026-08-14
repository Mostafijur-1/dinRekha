import { describe, expect, it } from "vitest";

import { proportionalActivityScore } from "@/features/daily-activities/progress";

describe("proportionalActivityScore", () => {
  it("gives partial progress its proportional share of the score", () => {
    expect(
      proportionalActivityScore([
        { value: 10, target: 10 },
        { value: 5, target: 10 },
        { value: 0, target: 10 },
      ]),
    ).toBe(50);
  });

  it("caps an activity at full credit and handles an empty day", () => {
    expect(proportionalActivityScore([{ value: 15, target: 10 }])).toBe(100);
    expect(proportionalActivityScore([])).toBeNull();
  });
});
