"use client";

import { useState } from "react";

export function InviteLinkActions({
  appOrigin,
  path,
}: {
  appOrigin: string;
  path: string;
}) {
  const [feedback, setFeedback] = useState("");
  const absoluteUrl = new URL(path, appOrigin).toString();

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setFeedback("লিংক কপি হয়েছে। এখন যাকে যুক্ত করতে চান তাকে পাঠান।");
    } catch {
      setFeedback("কপি করা যায়নি। লিংকটি নির্বাচন করে কপি করুন।");
    }
  }

  async function shareLink() {
    if (!navigator.share) return copyLink();
    try {
      await navigator.share({
        title: "দিনরেখায় যুক্ত হওয়ার Invitation",
        text: "দিনরেখায় আমার সঙ্গে যুক্ত হোন।",
        url: absoluteUrl,
      });
      setFeedback("লিংকটি পাঠানো হয়েছে।");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setFeedback("লিংকটি পাঠানো যায়নি। চাইলে কপি করুন।");
    }
  }

  return (
    <div className="invite-link-actions">
      <input
        aria-label="সম্পূর্ণ Invitation-এর লিংক"
        readOnly
        value={absoluteUrl}
      />
      <div>
        <button className="activity-button" onClick={copyLink} type="button">
          লিংক কপি করুন
        </button>
        <button className="activity-button" onClick={shareLink} type="button">
          লিংক পাঠান
        </button>
        <a
          className="activity-button"
          href={path}
          target="_blank"
          rel="noreferrer"
        >
          লিংক খুলুন
        </a>
      </div>
      {feedback && <p role="status">{feedback}</p>}
    </div>
  );
}
