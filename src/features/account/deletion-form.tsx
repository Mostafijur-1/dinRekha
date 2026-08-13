"use client";

import { useActionState, useEffect } from "react";
import { signOut } from "next-auth/react";

import {
  initialDeletionState,
  requestAccountDeletion,
} from "@/features/account/deletion-actions";

export function AccountDeletionForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(
    requestAccountDeletion,
    initialDeletionState,
  );
  useEffect(() => {
    if (state.status === "success") void signOut({ callbackUrl: "/" });
  }, [state.status]);
  return (
    <form action={action} className="settings-delete-form">
      <label className="activity-field">
        <span>নিশ্চিত করতে লিখুন: {email}</span>
        <input type="email" name="email" autoComplete="off" required />
      </label>
      <button
        className="activity-button activity-button-danger"
        type="submit"
        disabled={pending}
      >
        {pending ? "Account বন্ধ হচ্ছে…" : "আমার Account বন্ধ করুন"}
      </button>
      {state.message && (
        <p
          className={`activity-form-message ${state.status === "error" ? "is-error" : ""}`}
          role="status"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
