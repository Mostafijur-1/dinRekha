"use server";

import { revalidatePath } from "next/cache";

import type { TimelineActionState } from "@/features/timeline/action-state";
import {
  allowedDateKey,
  dateKeyForTimezone,
} from "@/features/daily-activities/date";
import {
  createTimelineEntry,
  deleteTimelineEntry,
  updateTimelineEntry,
} from "@/features/timeline/repository";
import {
  timelineEntryIdSchema,
  timelineEntrySchema,
} from "@/features/timeline/schemas";
import {
  currentMinuteForTimezone,
  timeToMinute,
} from "@/features/timeline/time";
import { getCurrentUser } from "@/lib/auth";

function inputFrom(formData: FormData) {
  return timelineEntrySchema.safeParse({
    activity: formData.get("activity"),
    category: formData.get("category"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime") ?? "",
    note: formData.get("note") ?? "",
  });
}

function validatedDate(requested: FormDataEntryValue | null, todayKey: string) {
  if (typeof requested !== "string") return null;
  const dateKey = allowedDateKey(requested, todayKey);
  return dateKey === requested ? dateKey : null;
}

function temporalError(
  dateKey: string,
  todayKey: string,
  endTime: string,
  startTime: string,
  currentMinute: number,
): string | null {
  if (!endTime && dateKey !== todayKey) {
    return "আগের দিনের entry-তে শেষের সময় দিতে হবে।";
  }
  if (dateKey === todayKey && timeToMinute(startTime) > currentMinute) {
    return "ভবিষ্যৎ সময় থেকে Timeline শুরু করা যাবে না।";
  }
  if (
    dateKey === todayKey &&
    endTime &&
    timeToMinute(endTime) > currentMinute
  ) {
    return "ভবিষ্যৎ সময় Timeline-এ যোগ করা যাবে না।";
  }
  return null;
}

function messageFor(result: "success" | "not_found" | "overlap") {
  if (result === "overlap")
    return "এই সময়ের সঙ্গে আরেকটি Timeline entry মিলে যাচ্ছে।";
  if (result === "not_found") return "Timeline entry পাওয়া যায়নি।";
  return null;
}

export async function createTimelineEntryAction(
  _previous: TimelineActionState,
  formData: FormData,
): Promise<TimelineActionState> {
  const user = await getCurrentUser();
  if (!user)
    return { status: "error", message: "Session শেষ হয়েছে। আবার প্রবেশ করুন।" };
  const parsed = inputFrom(formData);
  const todayKey = dateKeyForTimezone(new Date(), user.timezone);
  const dateKey = validatedDate(formData.get("dateKey"), todayKey);
  if (!parsed.success || !dateKey) {
    return {
      status: "error",
      message: parsed.success
        ? "সঠিক দিন নির্বাচন করুন।"
        : (parsed.error.issues[0]?.message ?? "তথ্যগুলো আবার দেখুন।"),
    };
  }
  const error = temporalError(
    dateKey,
    todayKey,
    parsed.data.endTime,
    parsed.data.startTime,
    currentMinuteForTimezone(new Date(), user.timezone),
  );
  if (error) return { status: "error", message: error };
  const result = await createTimelineEntry(user.id, dateKey, parsed.data);
  const failure = messageFor(result);
  if (failure) return { status: "error", message: failure };
  revalidatePath("/dashboard");
  return { status: "success", message: "Timeline entry যোগ হয়েছে।" };
}

export async function updateTimelineEntryAction(
  entryId: string,
  _previous: TimelineActionState,
  formData: FormData,
): Promise<TimelineActionState> {
  const user = await getCurrentUser();
  const id = timelineEntryIdSchema.safeParse(entryId);
  if (!user || !id.success) {
    return { status: "error", message: "Timeline entry পাওয়া যায়নি।" };
  }
  const parsed = inputFrom(formData);
  const todayKey = dateKeyForTimezone(new Date(), user.timezone);
  const dateKey = validatedDate(formData.get("dateKey"), todayKey);
  if (!parsed.success || !dateKey) {
    return {
      status: "error",
      message: parsed.success
        ? "সঠিক দিন নির্বাচন করুন।"
        : (parsed.error.issues[0]?.message ?? "তথ্যগুলো আবার দেখুন।"),
    };
  }
  const error = temporalError(
    dateKey,
    todayKey,
    parsed.data.endTime,
    parsed.data.startTime,
    currentMinuteForTimezone(new Date(), user.timezone),
  );
  if (error) return { status: "error", message: error };
  const result = await updateTimelineEntry(
    user.id,
    id.data,
    dateKey,
    parsed.data,
  );
  const failure = messageFor(result);
  if (failure) return { status: "error", message: failure };
  revalidatePath("/dashboard");
  return { status: "success", message: "Timeline entry পরিবর্তন হয়েছে।" };
}

export async function deleteTimelineEntryAction(
  entryId: string,
): Promise<void> {
  const user = await getCurrentUser();
  const id = timelineEntryIdSchema.safeParse(entryId);
  if (!user || !id.success) return;
  await deleteTimelineEntry(user.id, id.data);
  revalidatePath("/dashboard");
}
