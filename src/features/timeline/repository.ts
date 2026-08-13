import "server-only";

import { ObjectId } from "mongodb";

import type { TimelineEntryInput } from "@/features/timeline/schemas";
import {
  rankTimelineSuggestions,
  type TimelineSuggestion,
  type TimelineSuggestionCandidate,
} from "@/features/timeline/suggestions";
import { minuteToTime, timeToMinute } from "@/features/timeline/time";
import {
  timelineEntriesCollection,
  type TimelineEntryDocument,
} from "@/lib/db/collections";
import { ensureDatabaseIndexes } from "@/lib/db/indexes";

export type TimelineEntryView = {
  id: string;
  activity: string;
  category: string;
  startMinute: number;
  endMinute?: number;
  startTime: string;
  endTime: string;
  note?: string;
  status: "completed" | "in_progress";
  duration: number;
};

export type TimelineMutationResult = "success" | "not_found" | "overlap";

function objectId(value: string): ObjectId | null {
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}

function interval(input: TimelineEntryInput) {
  const startMinute = timeToMinute(input.startTime);
  const endMinute = input.endTime ? timeToMinute(input.endTime) : undefined;
  return { startMinute, endMinute, occupiedEnd: endMinute ?? 1440 };
}

async function overlaps(
  ownerId: ObjectId,
  dateKey: string,
  startMinute: number,
  occupiedEnd: number,
  excludedId?: ObjectId,
): Promise<boolean> {
  const timeline = await timelineEntriesCollection();
  return Boolean(
    await timeline.findOne({
      ownerId,
      dateKey,
      ...(excludedId ? { _id: { $ne: excludedId } } : {}),
      startMinute: { $lt: occupiedEnd },
      $expr: {
        $gt: [{ $ifNull: ["$endMinute", 1440] }, startMinute],
      },
    }),
  );
}

export async function listTimelineEntries(
  ownerId: string,
  dateKey: string,
): Promise<TimelineEntryView[]> {
  const owner = objectId(ownerId);
  if (!owner) return [];
  await ensureDatabaseIndexes();
  const rows = await (
    await timelineEntriesCollection()
  )
    .find({ ownerId: owner, dateKey })
    .sort({ startMinute: 1, createdAt: 1 })
    .toArray();
  return rows.map((row) => ({
    id: row._id.toHexString(),
    activity: row.activity,
    category: row.category,
    startMinute: row.startMinute,
    endMinute: row.endMinute,
    startTime: minuteToTime(row.startMinute),
    endTime: row.endMinute === undefined ? "" : minuteToTime(row.endMinute),
    note: row.note,
    status: row.status,
    duration: (row.endMinute ?? row.startMinute) - row.startMinute,
  }));
}

export async function listTimelineSuggestions(
  ownerId: string,
  todayKey: string,
  currentMinute: number,
): Promise<TimelineSuggestion[]> {
  const owner = objectId(ownerId);
  if (!owner) return [];
  await ensureDatabaseIndexes();
  const candidates = await (
    await timelineEntriesCollection()
  )
    .aggregate<TimelineSuggestionCandidate>([
      { $match: { ownerId: owner } },
      {
        $group: {
          _id: { activity: "$activity", category: "$category" },
          activity: { $first: "$activity" },
          category: { $first: "$category" },
          uses: { $sum: 1 },
          lastUsedDate: { $max: "$dateKey" },
          typicalStartMinute: { $avg: "$startMinute" },
        },
      },
      { $sort: { uses: -1, lastUsedDate: -1 } },
      { $limit: 30 },
      { $project: { _id: 0 } },
    ])
    .toArray();

  return rankTimelineSuggestions(candidates, todayKey, currentMinute);
}

export async function createTimelineEntry(
  ownerId: string,
  dateKey: string,
  input: TimelineEntryInput,
): Promise<TimelineMutationResult> {
  const owner = objectId(ownerId);
  if (!owner) return "not_found";
  await ensureDatabaseIndexes();
  const { startMinute, endMinute, occupiedEnd } = interval(input);
  if (await overlaps(owner, dateKey, startMinute, occupiedEnd))
    return "overlap";
  const now = new Date();
  await (
    await timelineEntriesCollection()
  ).insertOne({
    _id: new ObjectId(),
    ownerId: owner,
    dateKey,
    activity: input.activity,
    category: input.category,
    startMinute,
    ...(endMinute === undefined ? {} : { endMinute }),
    ...(input.note ? { note: input.note } : {}),
    status: endMinute === undefined ? "in_progress" : "completed",
    createdAt: now,
    updatedAt: now,
  });
  return "success";
}

export async function updateTimelineEntry(
  ownerId: string,
  entryId: string,
  dateKey: string,
  input: TimelineEntryInput,
): Promise<TimelineMutationResult> {
  const owner = objectId(ownerId);
  const entry = objectId(entryId);
  if (!owner || !entry) return "not_found";
  const timeline = await timelineEntriesCollection();
  const existing = await timeline.findOne({
    _id: entry,
    ownerId: owner,
    dateKey,
  });
  if (!existing) return "not_found";
  const { startMinute, endMinute, occupiedEnd } = interval(input);
  if (await overlaps(owner, dateKey, startMinute, occupiedEnd, entry)) {
    return "overlap";
  }
  const fields: Partial<TimelineEntryDocument> = {
    activity: input.activity,
    category: input.category,
    startMinute,
    status: endMinute === undefined ? "in_progress" : "completed",
    updatedAt: new Date(),
    ...(endMinute === undefined ? {} : { endMinute }),
    ...(input.note ? { note: input.note } : {}),
  };
  await timeline.updateOne(
    { _id: entry, ownerId: owner, dateKey },
    {
      $set: fields,
      $unset: {
        ...(endMinute === undefined ? { endMinute: "" } : {}),
        ...(input.note ? {} : { note: "" }),
      },
    },
  );
  return "success";
}

export async function deleteTimelineEntry(
  ownerId: string,
  entryId: string,
): Promise<boolean> {
  const owner = objectId(ownerId);
  const entry = objectId(entryId);
  if (!owner || !entry) return false;
  const result = await (
    await timelineEntriesCollection()
  ).deleteOne({
    _id: entry,
    ownerId: owner,
  });
  return result.deletedCount === 1;
}
