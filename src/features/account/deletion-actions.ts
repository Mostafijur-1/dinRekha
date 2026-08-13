"use server";

import { normalizeEmail } from "@/lib/security/email";
import { markAccountForDeletion } from "@/features/auth/repositories/user-repository";
import { getCurrentUser } from "@/lib/auth";

export type DeletionState = {
  status: "idle" | "error" | "success";
  message: string;
};
export const initialDeletionState: DeletionState = {
  status: "idle",
  message: "",
};

export async function requestAccountDeletion(
  _previous: DeletionState,
  formData: FormData,
): Promise<DeletionState> {
  const user = await getCurrentUser();
  if (!user)
    return { status: "error", message: "Session শেষ হয়েছে। আবার প্রবেশ করুন।" };
  const confirmation = formData.get("email");
  if (
    typeof confirmation !== "string" ||
    normalizeEmail(confirmation) !== normalizeEmail(user.email)
  ) {
    return {
      status: "error",
      message: "নিশ্চিত করতে আপনার Google email হুবহু লিখুন।",
    };
  }
  if (!(await markAccountForDeletion(user.id))) {
    return {
      status: "error",
      message: "Account বন্ধ করা যায়নি। আবার চেষ্টা করুন।",
    };
  }
  return {
    status: "success",
    message: "Account বন্ধ হয়েছে। এখন sign out করা হচ্ছে…",
  };
}
