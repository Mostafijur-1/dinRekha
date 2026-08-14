"use client";

import { useActionState } from "react";
import { initialInviteActionState } from "@/features/connections/action-state";
import { createInviteAction } from "@/features/connections/actions";
import { InviteLinkActions } from "@/features/connections/invite-link-actions";

export function InviteCreator({ appOrigin }: { appOrigin: string }) {
  const [state, action, pending] = useActionState(
    createInviteAction,
    initialInviteActionState,
  );
  const path = state.token
    ? `/connections/invite?code=${encodeURIComponent(state.token)}`
    : null;
  return (
    <div className="connection-invite-box">
      <form action={action}>
        <button
          className="activity-button activity-button-primary"
          disabled={pending}
          type="submit"
        >
          {pending ? "Invitation তৈরি হচ্ছে…" : "নতুন Invitation তৈরি করুন"}
        </button>
      </form>
      {state.message && (
        <p
          className={`activity-form-message ${state.status === "error" ? "is-error" : ""}`}
          role="status"
        >
          {state.message}
        </p>
      )}
      {path && (
        <div className="connection-invite-result">
          <span>এই লিংক যাকে যুক্ত করতে চান তাকে পাঠান:</span>
          <InviteLinkActions appOrigin={appOrigin} path={path} />
          <small>একবার ব্যবহার করা যাবে এবং ২৪ ঘণ্টা পর মেয়াদ শেষ হবে।</small>
        </div>
      )}
    </div>
  );
}
