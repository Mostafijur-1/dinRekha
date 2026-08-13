import "server-only";

import { MongoServerError, ObjectId } from "mongodb";

import { rateLimitsCollection } from "@/lib/db/collections";
import { ensureDatabaseIndexes } from "@/lib/db/indexes";

export async function consumeRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  await ensureDatabaseIndexes();
  const collection = await rateLimitsCollection();
  const now = new Date();
  const existing = await collection.findOne({ key: input.key });

  if (existing && existing.expiresAt > now) {
    if (existing.count >= input.limit) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1_000),
        ),
      };
    }

    const update = await collection.updateOne(
      { _id: existing._id, count: { $lt: input.limit } },
      { $inc: { count: 1 } },
    );
    return update.modifiedCount === 1
      ? { allowed: true, retryAfterSeconds: 0 }
      : consumeRateLimit(input);
  }

  if (existing) await collection.deleteOne({ _id: existing._id });
  const expiresAt = new Date(now.getTime() + input.windowMs);

  try {
    await collection.insertOne({
      _id: new ObjectId(),
      key: input.key,
      count: 1,
      windowStartedAt: now,
      expiresAt,
    });
    return { allowed: true, retryAfterSeconds: 0 };
  } catch (error) {
    if (!(error instanceof MongoServerError) || error.code !== 11000)
      throw error;
    return consumeRateLimit(input);
  }
}
