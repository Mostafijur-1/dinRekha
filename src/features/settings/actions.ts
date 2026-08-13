"use server";

import { revalidatePath } from "next/cache";

import type { SettingsActionState } from "@/features/settings/action-state";
import { profileSettingsSchema } from "@/features/settings/schema";
import { updateUserProfile } from "@/features/auth/repositories/user-repository";
import { getCurrentUser } from "@/lib/auth";

export async function updateProfileAction(
  _previous: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await getCurrentUser();
  if (!user)
    return { status: "error", message: "Session শেষ হয়েছে। আবার প্রবেশ করুন।" };
  const parsed = profileSettingsSchema.safeParse({
    name: formData.get("name"),
    timezone: formData.get("timezone"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "তথ্যগুলো আবার দেখুন।",
    };
  }
  if (!(await updateUserProfile(user.id, parsed.data))) {
    return {
      status: "error",
      message: "Profile আপডেট করা যায়নি। আবার চেষ্টা করুন।",
    };
  }
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/settings");
  return { status: "success", message: "Profile সংরক্ষণ হয়েছে।" };
}
