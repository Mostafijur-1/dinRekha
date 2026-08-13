import "server-only";

import { ObjectId } from "mongodb";

import type { ActivityDefinitionInput } from "@/features/daily-activities/schemas";
import {
  dailyActivitiesCollection,
  dailyActivityProgressCollection,
  type ActivityMeasurement,
  type DailyActivityDocument,
} from "@/lib/db/collections";
import { ensureDatabaseIndexes } from "@/lib/db/indexes";

export type DailyActivityView = {
  id: string;
  name: string;
  description?: string;
  category: string;
  measurement: ActivityMeasurement;
  target: number;
  unit?: string;
  value: number;
  completed: boolean;
};

function objectId(value: string): ObjectId | null {
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}

export async function listDailyActivities(
  ownerId: string,
  dateKey: string,
): Promise<DailyActivityView[]> {
  const owner = objectId(ownerId);
  if (!owner) return [];
  await ensureDatabaseIndexes();
  const activities = await dailyActivitiesCollection();
  const rows = await activities
    .aggregate<DailyActivityDocument & { progress?: { value: number } }>([
      { $match: { ownerId: owner, status: "active" } },
      { $sort: { sortOrder: 1, createdAt: 1 } },
      {
        $lookup: {
          from: "dailyActivityProgress",
          let: { activityId: "$_id", ownerId: "$ownerId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$activityId", "$$activityId"] },
                    { $eq: ["$ownerId", "$$ownerId"] },
                    { $eq: ["$dateKey", dateKey] },
                  ],
                },
              },
            },
            { $project: { value: 1 } },
          ],
          as: "progressRows",
        },
      },
      { $set: { progress: { $first: "$progressRows" } } },
      { $unset: "progressRows" },
    ])
    .toArray();

  return rows.map((row) => {
    const value = row.progress?.value ?? 0;
    return {
      id: row._id.toHexString(),
      name: row.name,
      description: row.description,
      category: row.category,
      measurement: row.measurement,
      target: row.target,
      unit: row.unit,
      value,
      completed: value >= row.target,
    };
  });
}

export async function createDailyActivity(
  ownerId: string,
  input: ActivityDefinitionInput,
): Promise<string | null> {
  const owner = objectId(ownerId);
  if (!owner) return null;
  await ensureDatabaseIndexes();
  const activities = await dailyActivitiesCollection();
  const now = new Date();
  const result = await activities.insertOne({
    _id: new ObjectId(),
    ownerId: owner,
    name: input.name,
    category: input.category,
    measurement: input.measurement,
    target: input.target,
    ...(input.description ? { description: input.description } : {}),
    ...(input.unit ? { unit: input.unit } : {}),
    status: "active",
    sortOrder: Date.now(),
    createdAt: now,
    updatedAt: now,
  });
  return result.insertedId.toHexString();
}

export async function updateDailyActivity(
  ownerId: string,
  activityId: string,
  input: ActivityDefinitionInput,
): Promise<boolean> {
  const owner = objectId(ownerId);
  const activity = objectId(activityId);
  if (!owner || !activity) return false;
  const activities = await dailyActivitiesCollection();
  const existing = await activities.findOne({
    _id: activity,
    ownerId: owner,
    status: "active",
  });
  if (!existing || existing.measurement !== input.measurement) return false;
  const fields = {
    name: input.name,
    category: input.category,
    target: input.target,
    updatedAt: new Date(),
    ...(input.description ? { description: input.description } : {}),
    ...(input.unit ? { unit: input.unit } : {}),
  };
  const result = await activities.updateOne(
    { _id: activity, ownerId: owner, status: "active" },
    {
      $set: fields,
      $unset: {
        ...(input.description ? {} : { description: "" }),
        ...(input.unit ? {} : { unit: "" }),
      },
    },
  );
  return result.matchedCount === 1;
}

export async function archiveDailyActivity(
  ownerId: string,
  activityId: string,
): Promise<boolean> {
  const owner = objectId(ownerId);
  const activity = objectId(activityId);
  if (!owner || !activity) return false;
  const now = new Date();
  const result = await (
    await dailyActivitiesCollection()
  ).updateOne(
    { _id: activity, ownerId: owner, status: "active" },
    { $set: { status: "archived", archivedAt: now, updatedAt: now } },
  );
  return result.matchedCount === 1;
}

export async function setDailyProgress(
  ownerId: string,
  activityId: string,
  dateKey: string,
  value: number,
): Promise<boolean> {
  const owner = objectId(ownerId);
  const activity = objectId(activityId);
  if (!owner || !activity) return false;
  const definition = await (
    await dailyActivitiesCollection()
  ).findOne({
    _id: activity,
    ownerId: owner,
    status: "active",
  });
  if (!definition) return false;
  const normalizedValue =
    definition.measurement === "boolean" ? (value ? 1 : 0) : value;
  const now = new Date();
  const completion =
    normalizedValue >= definition.target
      ? { $set: { completedAt: now } }
      : { $unset: { completedAt: "" as const } };
  await (
    await dailyActivityProgressCollection()
  ).updateOne(
    { ownerId: owner, activityId: activity, dateKey },
    {
      $set: {
        value: normalizedValue,
        updatedAt: now,
        ...(completion.$set ?? {}),
      },
      ...(completion.$unset ? { $unset: completion.$unset } : {}),
      $setOnInsert: { _id: new ObjectId(), createdAt: now },
    },
    { upsert: true },
  );
  return true;
}
