import { describe, expect, it } from "vitest";

import { buildActivityHistory } from "@/features/reports/activity-history";

describe("activity history", () => {
  it("maps values, targets and off-days into a 30-day trend", () => {
    const dateKeys = Array.from(
      { length: 31 },
      (_, index) => `2026-08-${String(index + 1).padStart(2, "0")}`,
    );
    const history = buildActivityHistory({
      activity: {
        id: "activity",
        name: "হাঁটা",
        category: "স্বাস্থ্য",
        measurement: "counter",
        target: 2,
        frequency: "selected_days",
        days: [1],
      },
      dateKeys,
      todayKey: "2026-08-31",
      progress: [{ activityId: "activity", dateKey: "2026-08-24", value: 1 }],
    });

    expect(history.days).toHaveLength(30);
    expect(
      history.days.find((day) => day.dateKey === "2026-08-24"),
    ).toMatchObject({
      scheduled: true,
      value: 1,
      completed: false,
      percentage: 50,
    });
    expect(
      history.days.find((day) => day.dateKey === "2026-08-25")?.scheduled,
    ).toBe(false);
  });

  it("caps progress bars at one hundred percent", () => {
    const history = buildActivityHistory({
      activity: {
        id: "activity",
        name: "পানি",
        category: "স্বাস্থ্য",
        measurement: "quantity",
        unit: "গ্লাস",
        target: 8,
        frequency: "daily",
        days: [],
      },
      dateKeys: ["2026-08-12", "2026-08-13"],
      todayKey: "2026-08-13",
      progress: [{ activityId: "activity", dateKey: "2026-08-13", value: 12 }],
    });
    expect(history.days.at(-1)).toMatchObject({
      completed: true,
      percentage: 100,
    });
  });
});
