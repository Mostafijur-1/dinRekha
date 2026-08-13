import { describe, expect, it } from "vitest";

import { defaultReminderSettings } from "@/features/auth/repositories/user-repository";
import {
  buildDashboardReminders,
  minuteFromClock,
} from "@/features/notifications/due";

describe("dashboard reminders", () => {
  it("validates clock times", () => {
    expect(minuteFromClock("20:30")).toBe(1230);
    expect(minuteFromClock("24:00")).toBeNull();
  });

  it("shows only due and incomplete activity reminders", () => {
    const reminders = buildDashboardReminders(
      defaultReminderSettings,
      [
        {
          id: "due",
          name: "পড়া",
          completed: false,
          reminderEnabled: true,
          preferredTime: "08:00",
        },
        {
          id: "done",
          name: "হাঁটা",
          completed: true,
          reminderEnabled: true,
          preferredTime: "07:00",
        },
        {
          id: "later",
          name: "ব্যায়াম",
          completed: false,
          reminderEnabled: true,
          preferredTime: "20:00",
        },
      ],
      600,
    );
    expect(reminders.map((item) => item.id)).toEqual(["activity:due"]);
  });

  it("honors every granular master switch", () => {
    const reminders = buildDashboardReminders(
      {
        ...defaultReminderSettings,
        activity: false,
        endOfDay: true,
        dailySummary: true,
        streak: true,
      },
      [
        {
          id: "a",
          name: "পড়া",
          completed: false,
          reminderEnabled: true,
          preferredTime: "08:00",
        },
      ],
      23 * 60,
    );
    expect(reminders.map((item) => item.id)).toEqual([
      "end-of-day",
      "streak",
      "daily-summary",
    ]);
  });
});
