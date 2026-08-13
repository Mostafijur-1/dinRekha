"use server";

import { revalidatePath } from "next/cache";

import type { SettingsActionState } from "@/features/settings/action-state";
import { reminderSettingsSchema } from "@/features/notifications/schema";
import { updateReminderSettings } from "@/features/auth/repositories/user-repository";
import { getCurrentUser } from "@/lib/auth";

export async function updateReminderSettingsAction(
  _previous: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await getCurrentUser();
  if (!user)
    return { status: "error", message: "Session শেষ হয়েছে। আবার প্রবেশ করুন।" };
  const parsed = reminderSettingsSchema.safeParse({
    activity: formData.get("activity") === "on",
    endOfDay: formData.get("endOfDay") === "on",
    dailySummary: formData.get("dailySummary") === "on",
    streak: formData.get("streak") === "on",
    endOfDayTime: formData.get("endOfDayTime"),
    dailySummaryTime: formData.get("dailySummaryTime"),
  });
  if (!parsed.success)
    return { status: "error", message: "Reminder-এর সময় ঠিকভাবে দিন।" };
  if (!(await updateReminderSettings(user.id, parsed.data))) {
    return { status: "error", message: "Reminder Settings সংরক্ষণ করা যায়নি।" };
  }
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { status: "success", message: "Reminder Settings সংরক্ষণ হয়েছে।" };
}
