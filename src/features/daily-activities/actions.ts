"use server";

import { revalidatePath } from "next/cache";

import type { ActivityActionState } from "@/features/daily-activities/action-state";
import {
  allowedDateKey,
  dateKeyForTimezone,
} from "@/features/daily-activities/date";
import {
  archiveDailyActivity,
  createDailyActivity,
  reorderDailyActivity,
  setDailyProgress,
  updateDailyActivity,
} from "@/features/daily-activities/repository";
import {
  activityDefinitionSchema,
  activityIdSchema,
  dateKeySchema,
  progressValueSchema,
  reorderDirectionSchema,
} from "@/features/daily-activities/schemas";
import { getCurrentUser } from "@/lib/auth";

function definitionFrom(formData: FormData) {
  return activityDefinitionSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    category: formData.get("category"),
    measurement: formData.get("measurement"),
    target: formData.get("target"),
    unit: formData.get("unit") ?? "",
    frequency: formData.get("frequency"),
    days: [...new Set(formData.getAll("days"))],
    preferredTime: formData.get("preferredTime") ?? "",
    reminderEnabled: formData.get("reminderEnabled") === "on",
  });
}

async function authenticatedUser() {
  return getCurrentUser();
}

export async function createActivityAction(
  _previous: ActivityActionState,
  formData: FormData,
): Promise<ActivityActionState> {
  const user = await authenticatedUser();
  if (!user)
    return { status: "error", message: "Session শেষ হয়েছে। আবার প্রবেশ করুন।" };
  const parsed = definitionFrom(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "তথ্যগুলো আবার দেখুন।",
    };
  }
  const effectiveFrom = dateKeyForTimezone(new Date(), user.timezone);
  await createDailyActivity(user.id, parsed.data, effectiveFrom);
  revalidatePath("/dashboard");
  return { status: "success", message: "Daily Activity তৈরি হয়েছে।" };
}

export async function updateActivityAction(
  activityId: string,
  _previous: ActivityActionState,
  formData: FormData,
): Promise<ActivityActionState> {
  const user = await authenticatedUser();
  if (!user)
    return { status: "error", message: "Session শেষ হয়েছে। আবার প্রবেশ করুন।" };
  const id = activityIdSchema.safeParse(activityId);
  const parsed = definitionFrom(formData);
  if (!id.success || !parsed.success) {
    return {
      status: "error",
      message: parsed.success
        ? "Activity পাওয়া যায়নি।"
        : (parsed.error.issues[0]?.message ?? "তথ্যগুলো আবার দেখুন।"),
    };
  }
  const updated = await updateDailyActivity(user.id, id.data, parsed.data);
  if (!updated)
    return { status: "error", message: "Activity পরিবর্তন করা যায়নি।" };
  revalidatePath("/dashboard");
  return { status: "success", message: "Activity পরিবর্তন হয়েছে।" };
}

export async function archiveActivityAction(activityId: string): Promise<void> {
  const user = await authenticatedUser();
  const id = activityIdSchema.safeParse(activityId);
  if (!user || !id.success) return;
  await archiveDailyActivity(user.id, id.data);
  revalidatePath("/dashboard");
}

export async function setProgressAction(
  activityId: string,
  formData: FormData,
): Promise<void> {
  const user = await authenticatedUser();
  const id = activityIdSchema.safeParse(activityId);
  const value = progressValueSchema.safeParse(formData.get("value"));
  const requestedDate = dateKeySchema.safeParse(formData.get("dateKey"));
  if (!user || !id.success || !value.success || !requestedDate.success) return;
  const todayKey = dateKeyForTimezone(new Date(), user.timezone);
  const dateKey = allowedDateKey(requestedDate.data, todayKey);
  if (dateKey !== requestedDate.data) return;
  await setDailyProgress(user.id, id.data, dateKey, value.data);
  revalidatePath("/dashboard");
}

export async function reorderActivityAction(
  activityId: string,
  formData: FormData,
): Promise<void> {
  const user = await authenticatedUser();
  const id = activityIdSchema.safeParse(activityId);
  const direction = reorderDirectionSchema.safeParse(formData.get("direction"));
  const requestedDate = dateKeySchema.safeParse(formData.get("dateKey"));
  if (!user || !id.success || !direction.success || !requestedDate.success)
    return;
  const todayKey = dateKeyForTimezone(new Date(), user.timezone);
  const dateKey = allowedDateKey(requestedDate.data, todayKey);
  if (dateKey !== requestedDate.data) return;
  await reorderDailyActivity(user.id, id.data, direction.data, dateKey);
  revalidatePath("/dashboard");
}
