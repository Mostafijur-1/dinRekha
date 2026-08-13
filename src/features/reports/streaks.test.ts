import { describe, expect, it } from "vitest";

import { buildActivityConsistency } from "@/features/reports/streaks";

const daily = {
  id: "daily",
  name: "বই পড়া",
  category: "শেখা",
  target: 1,
  frequency: "daily" as const,
  days: [],
};

describe("activity consistency", () => {
  it("does not break an active streak before today is complete", () => {
    const result = buildActivityConsistency({
      dateKeys: ["2026-08-10", "2026-08-11", "2026-08-12", "2026-08-13"],
      todayKey: "2026-08-13",
      activities: [daily],
      progress: [
        { activityId: "daily", dateKey: "2026-08-11", value: 1 },
        { activityId: "daily", dateKey: "2026-08-12", value: 1 },
      ],
    });
    expect(result[0]).toMatchObject({
      currentStreak: 2,
      bestStreak: 2,
      completedDays: 2,
      scheduledDays: 3,
      consistency: 67,
    });
  });

  it("counts selected scheduled occurrences instead of calendar gaps", () => {
    const result = buildActivityConsistency({
      dateKeys: [
        "2026-08-07",
        "2026-08-08",
        "2026-08-09",
        "2026-08-10",
        "2026-08-11",
        "2026-08-12",
        "2026-08-13",
      ],
      todayKey: "2026-08-13",
      activities: [
        { ...daily, id: "selected", frequency: "selected_days", days: [1, 3] },
      ],
      progress: [
        { activityId: "selected", dateKey: "2026-08-10", value: 1 },
        { activityId: "selected", dateKey: "2026-08-12", value: 1 },
      ],
    });
    expect(result[0]).toMatchObject({ currentStreak: 2, bestStreak: 2 });
  });

  it("respects effective and archived date boundaries", () => {
    const result = buildActivityConsistency({
      dateKeys: ["2026-08-10", "2026-08-11", "2026-08-12", "2026-08-13"],
      todayKey: "2026-08-13",
      activities: [
        { ...daily, effectiveFrom: "2026-08-11", archivedOn: "2026-08-12" },
      ],
      progress: [],
    });
    expect(result[0]).toMatchObject({ scheduledDays: 2, consistency: 0 });
  });
});
