"use server";

import { revalidatePath } from "next/cache";
import type { InviteActionState } from "@/features/connections/action-state";
import {
  createConnectionInvite,
  disconnectConnection,
  redeemConnectionInvite,
} from "@/features/connections/repository";
import { getCurrentUser } from "@/lib/auth";

export async function createInviteAction(
  previous: InviteActionState,
): Promise<InviteActionState> {
  void previous;
  const user = await getCurrentUser();
  if (!user)
    return { status: "error", message: "Session শেষ হয়েছে। আবার প্রবেশ করুন।" };
  const result = await createConnectionInvite(user.id);
  if (result.status === "rate_limited")
    return {
      status: "error",
      message: "আজকের invite সীমা শেষ হয়েছে বা ইতিমধ্যে ৫টি invite সক্রিয় আছে।",
    };
  if (result.status !== "success")
    return { status: "error", message: "Invite তৈরি করা যায়নি।" };
  return {
    status: "success",
    message: "Invite ২৪ ঘণ্টার জন্য তৈরি হয়েছে।",
    token: result.token,
  };
}

export async function redeemInviteAction(token: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !(await redeemConnectionInvite(token, user.id))) return;
  revalidatePath("/connections");
}

export async function disconnectAction(connectionId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await disconnectConnection(user.id, connectionId);
  revalidatePath("/connections");
}
