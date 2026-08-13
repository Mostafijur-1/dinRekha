import { describe, expect, it } from "vitest";

import {
  buildProductivityReport,
  completionScore,
} from "@/features/reports/engine";

describe("productivity report engine", () => {
  it("explains completion score and avoids a false zero", () => {
    expect(completionScore(3, 4)).toBe(75);
    expect(completionScore(0, 0)).toBeNull();
  });

  it("aggregates scheduled targets, tracked time and categories", () => {
    const report = buildProductivityReport({
      dateKeys: ["2026-08-12", "2026-08-13"],
      todayKey: "2026-08-13",
      currentMinute: 720,
      activities: [
        {
          id: "one",
          name: "পড়া",
          category: "শেখা",
          target: 1,
          frequency: "daily",
          days: [],
        },
      ],
      progress: [{ activityId: "one", dateKey: "2026-08-12", value: 1 }],
      timeline: [
        {
          dateKey: "2026-08-12",
          category: "কাজ",
          startMinute: 600,
          endMinute: 660,
        },
        { dateKey: "2026-08-13", category: "কাজ", startMinute: 690 },
      ],
    });

    expect(report.weekly).toEqual({
      trackedMinutes: 90,
      plannedActivities: 2,
      completedActivities: 1,
      score: 50,
    });
    expect(report.today.untrackedMinutes).toBe(690);
    expect(report.categories).toEqual([
      { category: "কাজ", minutes: 90, percentage: 100 },
    ]);
  });

  it("does not count selected-day activities on other weekdays", () => {
    const report = buildProductivityReport({
      dateKeys: ["2026-08-13"],
      todayKey: "2026-08-13",
      currentMinute: 600,
      activities: [
        {
          id: "weekly",
          name: "ব্যায়াম",
          category: "স্বাস্থ্য",
          target: 1,
          frequency: "selected_days",
          days: [5],
        },
      ],
      progress: [],
      timeline: [],
    });
    expect(report.today.plannedActivities).toBe(0);
    expect(report.today.score).toBeNull();
  });
});
