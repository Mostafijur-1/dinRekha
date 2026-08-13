import { MongoServerError, ObjectId } from "mongodb";

import {
  pushSubscriptionSchema,
  unsubscribeSchema,
} from "@/features/notifications/push-schema";
import { getCurrentUser } from "@/lib/auth";
import { ensureDatabaseIndexes } from "@/lib/db/indexes";
import { pushSubscriptionsCollection } from "@/lib/db/collections";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = pushSubscriptionSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return Response.json({ error: "Invalid subscription" }, { status: 400 });
  await ensureDatabaseIndexes();
  const now = new Date();
  try {
    await (
      await pushSubscriptionsCollection()
    ).updateOne(
      { endpoint: parsed.data.endpoint, ownerId: new ObjectId(user.id) },
      {
        $set: {
          keys: parsed.data.keys,
          userAgent: request.headers.get("user-agent")?.slice(0, 300),
          updatedAt: now,
        },
        $setOnInsert: { _id: new ObjectId(), createdAt: now },
      },
      { upsert: true },
    );
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return Response.json(
        { error: "Subscription belongs to another account" },
        { status: 409 },
      );
    }
    throw error;
  }
  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = unsubscribeSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return Response.json({ error: "Invalid subscription" }, { status: 400 });
  await (
    await pushSubscriptionsCollection()
  ).deleteOne({
    ownerId: new ObjectId(user.id),
    endpoint: parsed.data.endpoint,
  });
  return Response.json({ success: true });
}
