import "server-only";

import { ObjectId } from "mongodb";

import {
  dailyActivitiesCollection,
  dailyActivityProgressCollection,
  timelineEntriesCollection,
} from "@/lib/db/collections";

export async function buildAccountExport(user: {
  id: string;
  name: string;
  email: string;
  timezone: string;
}) {
  if (!ObjectId.isValid(user.id)) return null;
  const ownerId = new ObjectId(user.id);
  const [activities, progress, timeline] = await Promise.all([
    (await dailyActivitiesCollection())
      .find({ ownerId })
      .sort({ createdAt: 1 })
      .toArray(),
    (await dailyActivityProgressCollection())
      .find({ ownerId })
      .sort({ dateKey: 1 })
      .toArray(),
    (await timelineEntriesCollection())
      .find({ ownerId })
      .sort({ dateKey: 1, startMinute: 1 })
      .toArray(),
  ]);
  return {
    format: "dinrekha-account-export-v1",
    exportedAt: new Date().toISOString(),
    profile: { name: user.name, email: user.email, timezone: user.timezone },
    dailyActivities: activities.map((item) => ({
      id: item._id.toHexString(),
      name: item.name,
      description: item.description,
      category: item.category,
      measurement: item.measurement,
      target: item.target,
      unit: item.unit,
      frequency: item.frequency,
      days: item.days,
      effectiveFrom: item.effectiveFrom,
      status: item.status,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      archivedAt: item.archivedAt,
    })),
    dailyActivityProgress: progress.map((item) => ({
      id: item._id.toHexString(),
      activityId: item.activityId.toHexString(),
      dateKey: item.dateKey,
      value: item.value,
      completedAt: item.completedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
    timelineEntries: timeline.map((item) => ({
      id: item._id.toHexString(),
      dateKey: item.dateKey,
      activity: item.activity,
      category: item.category,
      startMinute: item.startMinute,
      endMinute: item.endMinute,
      note: item.note,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
  };
}
