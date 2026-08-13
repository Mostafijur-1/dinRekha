import { describe, expect, it } from "vitest";

import { timelineEntrySchema } from "@/features/timeline/schemas";

const valid = {
  activity: "পড়াশোনা",
  category: "কাজ",
  startTime: "09:00",
  endTime: "10:00",
  note: "",
};

describe("Timeline validation", () => {
  it("accepts completed and in-progress entries", () => {
    expect(timelineEntrySchema.safeParse(valid).success).toBe(true);
    expect(
      timelineEntrySchema.safeParse({ ...valid, endTime: "" }).success,
    ).toBe(true);
  });

  it("requires the end time to be after the start time", () => {
    expect(
      timelineEntrySchema.safeParse({ ...valid, endTime: "08:59" }).success,
    ).toBe(false);
  });

  it("rejects invalid clock values", () => {
    expect(
      timelineEntrySchema.safeParse({ ...valid, startTime: "24:00" }).success,
    ).toBe(false);
  });
});
