import { activityIsScheduled } from "@/features/reports/streaks";

export type ReportActivity = {
  id: string;
  name: string;
  category: string;
  target: number;
  frequency: "daily" | "selected_days";
  days: number[];
  effectiveFrom?: string;
  archivedOn?: string;
};

export type ReportProgress = {
  activityId: string;
  dateKey: string;
  value: number;
};

export type ReportTimelineEntry = {
  dateKey: string;
  category: string;
  startMinute: number;
  endMinute?: number;
};

export type ReportDay = {
  dateKey: string;
  trackedMinutes: number;
  availableMinutes: number;
  untrackedMinutes: number;
  plannedActivities: number;
  completedActivities: number;
  score: number | null;
};

export type ProductivityReport = {
  days: ReportDay[];
  today: ReportDay;
  weekly: {
    trackedMinutes: number;
    plannedActivities: number;
    completedActivities: number;
    score: number | null;
  };
  categories: Array<{ category: string; minutes: number; percentage: number }>;
};

export function completionScore(completed: number, planned: number) {
  return planned > 0 ? Math.round((completed / planned) * 100) : null;
}

export function buildProductivityReport({
  dateKeys,
  todayKey,
  currentMinute,
  activities,
  progress,
  timeline,
}: {
  dateKeys: string[];
  todayKey: string;
  currentMinute: number;
  activities: ReportActivity[];
  progress: ReportProgress[];
  timeline: ReportTimelineEntry[];
}): ProductivityReport {
  const progressByDay = new Map<string, Map<string, number>>();
  for (const item of progress) {
    const day = progressByDay.get(item.dateKey) ?? new Map<string, number>();
    day.set(item.activityId, item.value);
    progressByDay.set(item.dateKey, day);
  }

  const categoryMinutes = new Map<string, number>();
  const days = dateKeys.map((dateKey) => {
    const availableMinutes = dateKey === todayKey ? currentMinute : 1440;
    const scheduled = activities.filter((activity) =>
      activityIsScheduled(activity, dateKey),
    );
    const dayProgress = progressByDay.get(dateKey);
    const completedActivities = scheduled.filter(
      (activity) => (dayProgress?.get(activity.id) ?? 0) >= activity.target,
    ).length;
    const trackedMinutes = timeline
      .filter((entry) => entry.dateKey === dateKey)
      .reduce((total, entry) => {
        const end =
          entry.endMinute ??
          (dateKey === todayKey ? currentMinute : entry.startMinute);
        const duration = Math.max(
          0,
          Math.min(end, availableMinutes) - entry.startMinute,
        );
        if (duration > 0) {
          categoryMinutes.set(
            entry.category,
            (categoryMinutes.get(entry.category) ?? 0) + duration,
          );
        }
        return total + duration;
      }, 0);

    return {
      dateKey,
      trackedMinutes,
      availableMinutes,
      untrackedMinutes: Math.max(0, availableMinutes - trackedMinutes),
      plannedActivities: scheduled.length,
      completedActivities,
      score: completionScore(completedActivities, scheduled.length),
    };
  });

  const weekly = days.reduce(
    (total, day) => ({
      trackedMinutes: total.trackedMinutes + day.trackedMinutes,
      plannedActivities: total.plannedActivities + day.plannedActivities,
      completedActivities: total.completedActivities + day.completedActivities,
      score: null as number | null,
    }),
    {
      trackedMinutes: 0,
      plannedActivities: 0,
      completedActivities: 0,
      score: null as number | null,
    },
  );
  weekly.score = completionScore(
    weekly.completedActivities,
    weekly.plannedActivities,
  );
  const categoryTotal = [...categoryMinutes.values()].reduce(
    (total, minutes) => total + minutes,
    0,
  );
  const categories = [...categoryMinutes]
    .map(([category, minutes]) => ({
      category,
      minutes,
      percentage: categoryTotal
        ? Math.round((minutes / categoryTotal) * 100)
        : 0,
    }))
    .sort(
      (a, b) =>
        b.minutes - a.minutes || a.category.localeCompare(b.category, "bn"),
    );

  return { days, today: days.at(-1)!, weekly, categories };
}
