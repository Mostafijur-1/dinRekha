import type { ReminderSettings } from "@/features/auth/repositories/user-repository";

type ReminderActivity = {
  id: string;
  name: string;
  completed: boolean;
  reminderEnabled: boolean;
  preferredTime?: string;
};

export type DashboardReminder = {
  id: string;
  title: string;
  detail: string;
  minute: number;
};

export function minuteFromClock(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

export function buildDashboardReminders(
  settings: ReminderSettings,
  activities: ReminderActivity[],
  currentMinute: number,
): DashboardReminder[] {
  const reminders: DashboardReminder[] = [];
  if (settings.activity) {
    for (const activity of activities) {
      const minute = activity.preferredTime
        ? minuteFromClock(activity.preferredTime)
        : null;
      if (
        activity.reminderEnabled &&
        !activity.completed &&
        minute !== null &&
        minute <= currentMinute
      ) {
        reminders.push({
          id: `activity:${activity.id}`,
          title: activity.name,
          detail: `${activity.preferredTime} থেকে বাকি`,
          minute,
        });
      }
    }
  }
  const endOfDayMinute = minuteFromClock(settings.endOfDayTime);
  if (
    settings.endOfDay &&
    endOfDayMinute !== null &&
    endOfDayMinute <= currentMinute
  ) {
    reminders.push({
      id: "end-of-day",
      title: "আজকের Timeline পূর্ণ করুন",
      detail: "বাদ পড়া সময় থাকলে এখন যোগ করুন।",
      minute: endOfDayMinute,
    });
  }
  const summaryMinute = minuteFromClock(settings.dailySummaryTime);
  if (
    settings.dailySummary &&
    summaryMinute !== null &&
    summaryMinute <= currentMinute
  ) {
    reminders.push({
      id: "daily-summary",
      title: "আজকের Daily Summary দেখুন",
      detail: "দিনের অগ্রগতি ও সময় এক নজরে দেখুন।",
      minute: summaryMinute,
    });
  }
  if (
    settings.streak &&
    endOfDayMinute !== null &&
    endOfDayMinute <= currentMinute &&
    activities.some((activity) => !activity.completed)
  ) {
    reminders.push({
      id: "streak",
      title: "আজকের অসম্পন্ন Activity দেখুন",
      detail: "প্রযোজ্য হলে streak ধরে রাখতে এখনই অগ্রগতি দিন।",
      minute: endOfDayMinute,
    });
  }
  return reminders.sort((a, b) => a.minute - b.minute);
}
