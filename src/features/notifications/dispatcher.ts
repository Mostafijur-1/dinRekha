import "server-only";

import webpush from "web-push";
import { MongoServerError, ObjectId } from "mongodb";

import {
  dateKeyForTimezone,
  weekdayForDateKey,
} from "@/features/daily-activities/date";
import { defaultReminderSettings } from "@/features/auth/repositories/user-repository";
import { currentMinuteForTimezone } from "@/features/timeline/time";
import { minuteFromClock } from "@/features/notifications/due";
import {
  dailyActivitiesCollection,
  dailyActivityProgressCollection,
  notificationDeliveriesCollection,
  pushSubscriptionsCollection,
  usersCollection,
} from "@/lib/db/collections";
import { ensureDatabaseIndexes } from "@/lib/db/indexes";
import { getServerEnvironment } from "@/lib/env.server";

type DueKind = "activity" | "end_of_day" | "daily_summary" | "streak";

function inWindow(scheduled: number | null, current: number) {
  return scheduled !== null && scheduled <= current && scheduled > current - 15;
}

async function claim(
  ownerId: ObjectId,
  kind: DueKind,
  dateKey: string,
  scheduledMinute: number,
) {
  const now = new Date();
  const deliveries = await notificationDeliveriesCollection();
  try {
    await deliveries.insertOne({
      _id: new ObjectId(),
      ownerId,
      kind,
      dateKey,
      scheduledMinute,
      status: "pending",
      attempts: 1,
      createdAt: now,
      updatedAt: now,
    });
    return true;
  } catch (error) {
    if (!(error instanceof MongoServerError) || error.code !== 11000)
      throw error;
    const result = await deliveries.updateOne(
      { ownerId, kind, dateKey, status: "failed", attempts: { $lt: 3 } },
      { $set: { status: "pending", updatedAt: now }, $inc: { attempts: 1 } },
    );
    return result.modifiedCount === 1;
  }
}

export async function dispatchDueNotifications(now = new Date()) {
  const environment = getServerEnvironment();
  if (
    !environment.VAPID_PRIVATE_KEY ||
    !environment.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  ) {
    return { users: 0, sent: 0, skipped: "vapid_not_configured" as const };
  }
  webpush.setVapidDetails(
    environment.VAPID_SUBJECT,
    environment.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    environment.VAPID_PRIVATE_KEY,
  );
  await ensureDatabaseIndexes();
  const users = await (
    await usersCollection()
  )
    .find({ status: "active" })
    .toArray();
  let sent = 0;
  for (const user of users) {
    const settings = { ...defaultReminderSettings, ...user.profile.reminders };
    const dateKey = dateKeyForTimezone(now, user.profile.timezone);
    const currentMinute = currentMinuteForTimezone(now, user.profile.timezone);
    const due: Array<{ kind: DueKind; minute: number; body: string }> = [];
    const endMinute = minuteFromClock(settings.endOfDayTime);
    const summaryMinute = minuteFromClock(settings.dailySummaryTime);
    if (settings.endOfDay && inWindow(endMinute, currentMinute))
      due.push({
        kind: "end_of_day",
        minute: endMinute!,
        body: "আজকের Timeline-এ বাদ পড়া সময় থাকলে যোগ করুন।",
      });
    if (settings.dailySummary && inWindow(summaryMinute, currentMinute))
      due.push({
        kind: "daily_summary",
        minute: summaryMinute!,
        body: "আজকের অগ্রগতি এক নজরে দেখে নিন।",
      });
    const weekday = weekdayForDateKey(dateKey);
    if (weekday === null) continue;
    const applicableActivities =
      settings.activity || settings.streak
        ? await (
            await dailyActivitiesCollection()
          )
            .find({
              ownerId: user._id,
              status: "active",
              $and: [
                {
                  $or: [
                    { effectiveFrom: { $exists: false } },
                    { effectiveFrom: { $lte: dateKey } },
                  ],
                },
                {
                  $or: [
                    { frequency: { $exists: false } },
                    { frequency: "daily" },
                    { frequency: "selected_days", days: weekday },
                  ],
                },
              ],
            })
            .toArray()
        : [];
    const scheduledActivities = applicableActivities.filter(
      (item) => item.reminderEnabled && Boolean(item.preferredTime),
    );
    const activityDue =
      settings.activity &&
      scheduledActivities.some((item) =>
        inWindow(minuteFromClock(item.preferredTime ?? ""), currentMinute),
      );
    if (activityDue)
      due.push({
        kind: "activity",
        minute: currentMinute,
        body: "আপনার একটি নির্ধারিত Activity এখনো বাকি আছে।",
      });
    if (
      settings.streak &&
      inWindow(endMinute, currentMinute) &&
      applicableActivities.length
    ) {
      const completed = await (
        await dailyActivityProgressCollection()
      ).countDocuments({
        ownerId: user._id,
        dateKey,
        activityId: { $in: applicableActivities.map((item) => item._id) },
        completedAt: { $exists: true },
      });
      if (completed < applicableActivities.length)
        due.push({
          kind: "streak",
          minute: endMinute!,
          body: "Streak ধরে রাখতে আজকের অসম্পন্ন Activity দেখুন।",
        });
    }
    if (!due.length) continue;
    const subscriptions = await (
      await pushSubscriptionsCollection()
    )
      .find({ ownerId: user._id })
      .toArray();
    if (!subscriptions.length) continue;
    for (const item of due) {
      if (!(await claim(user._id, item.kind, dateKey, item.minute))) continue;
      let delivered = false;
      for (const subscription of subscriptions) {
        try {
          await webpush.sendNotification(
            { endpoint: subscription.endpoint, keys: subscription.keys },
            JSON.stringify({
              title: "দিনরেখা Reminder",
              body: item.body,
              tag: `${item.kind}:${dateKey}`,
              url: "/dashboard",
            }),
          );
          delivered = true;
        } catch (error) {
          const statusCode =
            typeof error === "object" && error && "statusCode" in error
              ? Number(error.statusCode)
              : 0;
          if (statusCode === 404 || statusCode === 410)
            await (
              await pushSubscriptionsCollection()
            ).deleteOne({ _id: subscription._id });
        }
      }
      await (
        await notificationDeliveriesCollection()
      ).updateOne(
        { ownerId: user._id, kind: item.kind, dateKey, status: "pending" },
        {
          $set: {
            status: delivered ? "sent" : "failed",
            updatedAt: new Date(),
          },
        },
      );
      if (delivered) sent += 1;
    }
  }
  return { users: users.length, sent };
}
