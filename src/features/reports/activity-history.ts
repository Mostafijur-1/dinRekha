import type { ActivityMeasurement } from "@/lib/db/collections";
import type { ReportActivity, ReportProgress } from "@/features/reports/engine";
import {
  activityIsScheduled,
  buildActivityConsistency,
} from "@/features/reports/streaks";

export type ActivityHistoryDefinition = ReportActivity & {
  description?: string;
  measurement: ActivityMeasurement;
  unit?: string;
};

export type ActivityHistory = {
  activity: ActivityHistoryDefinition;
  currentStreak: number;
  bestStreak: number;
  consistency: number | null;
  completedDays: number;
  scheduledDays: number;
  days: Array<{
    dateKey: string;
    scheduled: boolean;
    value: number;
    completed: boolean;
    percentage: number;
  }>;
};

export function buildActivityHistory({
  activity,
  dateKeys,
  todayKey,
  progress,
}: {
  activity: ActivityHistoryDefinition;
  dateKeys: string[];
  todayKey: string;
  progress: ReportProgress[];
}): ActivityHistory {
  const values = new Map(progress.map((item) => [item.dateKey, item.value]));
  const consistency = buildActivityConsistency({
    dateKeys,
    todayKey,
    activities: [activity],
    progress,
  })[0];

  return {
    activity,
    currentStreak: consistency?.currentStreak ?? 0,
    bestStreak: consistency?.bestStreak ?? 0,
    consistency: consistency?.consistency ?? null,
    completedDays: consistency?.completedDays ?? 0,
    scheduledDays: consistency?.scheduledDays ?? 0,
    days: dateKeys.slice(-30).map((dateKey) => {
      const scheduled = activityIsScheduled(activity, dateKey);
      const value = values.get(dateKey) ?? 0;
      return {
        dateKey,
        scheduled,
        value,
        completed: scheduled && value >= activity.target,
        percentage: scheduled
          ? Math.min(100, Math.round((value / activity.target) * 100))
          : 0,
      };
    }),
  };
}
