"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function invitePath(value: string) {
  try {
    const url = new URL(value.trim(), window.location.origin);
    if (
      !/^https?:$/.test(url.protocol) ||
      url.pathname !== "/connections/invite"
    )
      return null;
    const code = url.searchParams.get("code");
    if (!code || code.length < 20 || code.length > 100) return null;
    return `/connections/invite?code=${encodeURIComponent(code)}`;
  } catch {
    return null;
  }
}

export function InviteLinkOpener() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const path = invitePath(String(data.get("inviteLink") || ""));
    if (!path) {
      setMessage("দিনরেখার সঠিক Invitation-এর লিংক দিন।");
      return;
    }
    router.push(path);
  }

  return (
    <form className="invite-link-opener" onSubmit={submit}>
      <label htmlFor="invite-link">আপনার কাছে আসা Invitation-এর লিংক</label>
      <div>
        <input
          id="invite-link"
          name="inviteLink"
          placeholder="https://dinrekha.vercel.app/connections/invite?code=…"
          type="url"
        />
        <button className="activity-button" type="submit">
          লিংক খুলুন
        </button>
      </div>
      {message && (
        <p className="activity-form-message is-error" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
