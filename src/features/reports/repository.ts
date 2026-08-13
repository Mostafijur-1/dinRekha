import "server-only";

import { ObjectId } from "mongodb";

import {
  buildProductivityReport,
  type ProductivityReport,
  type ReportActivity,
  type ReportProgress,
  type ReportTimelineEntry,
} from "@/features/reports/engine";
import {
  dailyActivitiesCollection,
  dailyActivityProgressCollection,
  timelineEntriesCollection,
} from "@/lib/db/collections";
import { ensureDatabaseIndexes } from "@/lib/db/indexes";

export async function getProductivityReport(
  ownerId: string,
  dateKeys: string[],
  todayKey: string,
  currentMinute: number,
): Promise<ProductivityReport | null> {
  if (!ObjectId.isValid(ownerId) || dateKeys.length === 0) return null;
  const owner = new ObjectId(ownerId);
  const firstDate = dateKeys[0]!;
  const lastDate = dateKeys.at(-1)!;
  await ensureDatabaseIndexes();

  const [activityRows, progressRows, timelineRows] = await Promise.all([
    (await dailyActivitiesCollection())
      .find({
        ownerId: owner,
        $or: [
          { effectiveFrom: { $exists: false } },
          { effectiveFrom: { $lte: lastDate } },
        ],
      })
      .toArray(),
    (await dailyActivityProgressCollection())
      .find({ ownerId: owner, dateKey: { $gte: firstDate, $lte: lastDate } })
      .toArray(),
    (await timelineEntriesCollection())
      .find({ ownerId: owner, dateKey: { $gte: firstDate, $lte: lastDate } })
      .toArray(),
  ]);

  const activities: ReportActivity[] = activityRows.map((activity) => ({
    id: activity._id.toHexString(),
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

  return buildProductivityReport({
    dateKeys,
    todayKey,
    currentMinute,
    activities,
    progress,
    timeline,
  });
}
