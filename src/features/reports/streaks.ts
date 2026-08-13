import type { ReportActivity, ReportProgress } from "@/features/reports/engine";

export type ActivityConsistency = {
  activityId: string;
  name: string;
  category: string;
  currentStreak: number;
  bestStreak: number;
  completedDays: number;
  scheduledDays: number;
  consistency: number | null;
};

function weekday(dateKey: string) {
  return new Date(`${dateKey}T12:00:00Z`).getUTCDay();
}

export function activityIsScheduled(
  activity: ReportActivity,
  dateKey: string,
): boolean {
  if (activity.effectiveFrom && activity.effectiveFrom > dateKey) return false;
  if (activity.archivedOn && activity.archivedOn < dateKey) return false;
  return (
    activity.frequency === "daily" || activity.days.includes(weekday(dateKey))
  );
}

export function buildActivityConsistency({
  dateKeys,
  todayKey,
  activities,
  progress,
}: {
  dateKeys: string[];
  todayKey: string;
  activities: ReportActivity[];
  progress: ReportProgress[];
}): ActivityConsistency[] {
  const progressValues = new Map(
    progress.map((item) => [`${item.activityId}:${item.dateKey}`, item.value]),
  );

  return activities
    .map((activity) => {
      const scheduledDates = dateKeys.filter((dateKey) =>
        activityIsScheduled(activity, dateKey),
      );
      const completed = (dateKey: string) =>
        (progressValues.get(`${activity.id}:${dateKey}`) ?? 0) >=
        activity.target;
      const completeDates = scheduledDates.filter(completed);
      const completedWindowDates = scheduledDates.filter(
        (dateKey) => dateKey < todayKey,
      );
      const completedDays = completedWindowDates.filter(completed).length;

      let currentStreak = 0;
      const streakDates =
        scheduledDates.at(-1) === todayKey && !completed(todayKey)
          ? scheduledDates.slice(0, -1)
          : scheduledDates;
      for (let index = streakDates.length - 1; index >= 0; index--) {
        if (!completed(streakDates[index]!)) break;
        currentStreak += 1;
      }

      let bestStreak = 0;
      let run = 0;
      for (const dateKey of scheduledDates) {
        run = completed(dateKey) ? run + 1 : 0;
        bestStreak = Math.max(bestStreak, run);
      }

      return {
        activityId: activity.id,
        name: activity.name,
        category: activity.category,
        currentStreak,
        bestStreak,
        completedDays,
        scheduledDays: completedWindowDates.length,
        consistency: completedWindowDates.length
          ? Math.round((completedDays / completedWindowDates.length) * 100)
          : null,
        hasProgress: completeDates.length > 0,
      };
    })
    .filter((item) => item.scheduledDays > 0 || item.hasProgress)
    .sort(
      (a, b) =>
        b.currentStreak - a.currentStreak ||
        (b.consistency ?? -1) - (a.consistency ?? -1) ||
        a.name.localeCompare(b.name, "bn"),
    )
    .map((item) => ({
      activityId: item.activityId,
      name: item.name,
      category: item.category,
      currentStreak: item.currentStreak,
      bestStreak: item.bestStreak,
      completedDays: item.completedDays,
      scheduledDays: item.scheduledDays,
      consistency: item.consistency,
    }));
}
