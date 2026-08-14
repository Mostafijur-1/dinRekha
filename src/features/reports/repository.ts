import "server-only";

import { ObjectId } from "mongodb";

import {
  buildActivityHistory,
  type ActivityHistory,
  type ActivityHistoryDefinition,
} from "@/features/reports/activity-history";
import {
  buildProductivityReport,
  type ProductivityReport,
  type ReportActivity,
  type ReportProgress,
  type ReportTimelineEntry,
} from "@/features/reports/engine";
import {
  buildActivityConsistency,
  type ActivityConsistency,
} from "@/features/reports/streaks";
import {
  dailyActivitiesCollection,
  dailyActivityProgressCollection,
  timelineEntriesCollection,
} from "@/lib/db/collections";
import { ensureDatabaseIndexes } from "@/lib/db/indexes";

export async function getActivityHistory(
  ownerId: string,
  activityId: string,
  dateKeys: string[],
  todayKey: string,
): Promise<ActivityHistory | null> {
  if (
    !ObjectId.isValid(ownerId) ||
    !ObjectId.isValid(activityId) ||
    dateKeys.length === 0
  ) {
    return null;
  }
  const owner = new ObjectId(ownerId);
  const activityObjectId = new ObjectId(activityId);
  await ensureDatabaseIndexes();
  const activity = await (
    await dailyActivitiesCollection()
  ).findOne({ _id: activityObjectId, ownerId: owner });
  if (!activity) return null;

  const progressRows = await (
    await dailyActivityProgressCollection()
  )
    .find({
      ownerId: owner,
      activityId: activityObjectId,
      dateKey: { $gte: dateKeys[0]!, $lte: dateKeys.at(-1)! },
    })
    .sort({ dateKey: 1 })
    .toArray();
  const definition: ActivityHistoryDefinition = {
    id: activity._id.toHexString(),
    name: activity.name,
    description: activity.description,
    category: activity.category,
    measurement: activity.measurement,
    target: activity.target,
    unit: activity.unit,
    frequency: activity.frequency ?? "daily",
    days: activity.days ?? [],
    effectiveFrom:
      activity.effectiveFrom ?? activity.createdAt.toISOString().slice(0, 10),
    archivedOn: activity.archivedAt?.toISOString().slice(0, 10),
  };

  return buildActivityHistory({
    activity: definition,
    dateKeys,
    todayKey,
    progress: progressRows.map((item) => ({
      activityId: item.activityId.toHexString(),
      dateKey: item.dateKey,
      value: item.value,
    })),
  });
}

export async function getProductivityReport(
  ownerId: string,
  dateKeys: string[],
  todayKey: string,
  currentMinute: number,
  historyDateKeys = dateKeys,
  options: { includeTimeline?: boolean; includeActivities?: boolean } = {},
): Promise<
  (ProductivityReport & { consistency: ActivityConsistency[] }) | null
> {
  if (!ObjectId.isValid(ownerId) || dateKeys.length === 0) return null;
  const owner = new ObjectId(ownerId);
  const firstDate = dateKeys[0]!;
  const progressStart = historyDateKeys[0] ?? firstDate;
  const lastDate = dateKeys.at(-1)!;
  await ensureDatabaseIndexes();

  const [activityRows, progressRows, timelineRows] = await Promise.all([
    options.includeActivities === false
      ? Promise.resolve([])
      : (await dailyActivitiesCollection())
          .find({
            ownerId: owner,
            $or: [
              { effectiveFrom: { $exists: false } },
              { effectiveFrom: { $lte: lastDate } },
            ],
          })
          .toArray(),
    options.includeActivities === false
      ? Promise.resolve([])
      : (await dailyActivityProgressCollection())
          .find({
            ownerId: owner,
            dateKey: { $gte: progressStart, $lte: lastDate },
          })
          .toArray(),
    options.includeTimeline === false
      ? Promise.resolve([])
      : (await timelineEntriesCollection())
          .find({
            ownerId: owner,
            dateKey: { $gte: firstDate, $lte: lastDate },
            startMinute: { $gte: 300 },
          })
          .toArray(),
  ]);

  const activities: ReportActivity[] = activityRows.map((activity) => ({
    id: activity._id.toHexString(),
    name: activity.name,
    category: activity.category,
    target: activity.target,
    frequency: activity.frequency ?? "daily",
    days: activity.days ?? [],
    effectiveFrom:
      activity.effectiveFrom ?? activity.createdAt.toISOString().slice(0, 10),
    archivedOn: activity.archivedAt?.toISOString().slice(0, 10),
  }));
  const progress: ReportProgress[] = progressRows.map((item) => ({
    activityId: item.activityId.toHexString(),
    dateKey: item.dateKey,
    value: item.value,
  }));
  const timeline: ReportTimelineEntry[] = timelineRows.map((entry) => ({
    dateKey: entry.dateKey,
    category: entry.category,
    startMinute: entry.startMinute,
    endMinute: entry.endMinute,
  }));

  const report = buildProductivityReport({
    dateKeys,
    todayKey,
    currentMinute,
    activities,
    progress,
    timeline,
  });
  return {
    ...report,
    consistency: buildActivityConsistency({
      dateKeys: historyDateKeys,
      todayKey,
      activities,
      progress,
    }),
  };
}
