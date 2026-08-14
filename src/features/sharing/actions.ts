"use server";

import { revalidatePath } from "next/cache";
import { setSharingPolicy } from "@/features/sharing/repository";
import { getCurrentUser } from "@/lib/auth";

export async function updateSharingAction(
  recipientId: string,
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await setSharingPolicy(user.id, recipientId, {
    productivitySummary: formData.get("productivitySummary") === "on",
    streaks: formData.get("streaks") === "on",
    dailyActivities: formData.get("dailyActivities") === "on",
    timeline: formData.get("timeline") === "on",
  });
  revalidatePath("/connections");
}
