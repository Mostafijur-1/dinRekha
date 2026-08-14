"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ArchivedDailyActivityView } from "@/features/daily-activities/repository";

export function ArchivedActivityList({
  activities,
}: {
  activities: ArchivedDailyActivityView[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    status: "success" | "error";
    text: string;
  } | null>(null);

  async function restore(activityId: string) {
    setPendingId(activityId);
    setMessage(null);
    try {
      const response = await fetch("/api/settings/activities/restore", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ activityId }),
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setMessage({
        status: response.ok ? "success" : "error",
        text:
          result?.message ||
          "Activity Restore করা যায়নি। পৃষ্ঠাটি refresh করে আবার চেষ্টা করুন।",
      });
      if (response.ok) router.refresh();
    } catch {
      setMessage({
        status: "error",
        text: "Network সমস্যার কারণে Restore করা যায়নি। আবার চেষ্টা করুন।",
      });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      {message && (
        <p
          className={`settings-archive-message ${message.status === "error" ? "is-error" : "is-success"}`}
          role="status"
        >
          {message.text}
        </p>
      )}
      {activities.length === 0 ? (
        <p className="settings-archive-empty">কোনো archived Activity নেই।</p>
      ) : (
        <div className="settings-archive-list">
          {activities.map((activity) => (
            <article className="settings-archive-item" key={activity.id}>
              <div>
                <strong>{activity.name}</strong>
                <span>{activity.category}</span>
              </div>
              <button
                className="activity-button activity-button-primary"
                disabled={pendingId !== null}
                onClick={() => restore(activity.id)}
                type="button"
              >
                {pendingId === activity.id ? "Restore হচ্ছে…" : "Restore"}
              </button>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
