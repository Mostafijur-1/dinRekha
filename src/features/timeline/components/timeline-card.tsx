"use client";

import { useActionState } from "react";

import { initialTimelineActionState } from "@/features/timeline/action-state";
import {
  deleteTimelineEntryAction,
  updateTimelineEntryAction,
} from "@/features/timeline/actions";
import { TimelineSubmitButton } from "@/features/timeline/components/timeline-submit-button";
import type { TimelineEntryView } from "@/features/timeline/repository";
import { durationLabel } from "@/features/timeline/time";

export function TimelineCard({
  entry,
  dateKey,
}: {
  entry: TimelineEntryView;
  dateKey: string;
}) {
  const updateAction = updateTimelineEntryAction.bind(null, entry.id);
  const deleteAction = deleteTimelineEntryAction.bind(null, entry.id);
  const [state, action] = useActionState(
    updateAction,
    initialTimelineActionState,
  );
  return (
    <article
      className={`timeline-card ${entry.status === "in_progress" ? "is-current" : ""}`}
    >
      <div className="timeline-time">
        <strong>{entry.startTime}</strong>
        <span>{entry.endTime || "এখন চলছে"}</span>
      </div>
      <div className="timeline-copy">
        <span>{entry.category}</span>
        <h3>{entry.activity}</h3>
        {entry.note && <p>{entry.note}</p>}
        {entry.duration > 0 && <small>{durationLabel(entry.duration)}</small>}
      </div>
      <details className="timeline-edit">
        <summary>Edit</summary>
        <form action={action} className="timeline-form">
          <input type="hidden" name="dateKey" value={dateKey} />
          <label className="activity-field">
            <span>Activity</span>
            <input
              name="activity"
              defaultValue={entry.activity}
              maxLength={80}
              minLength={2}
              required
            />
          </label>
          <div className="timeline-form-actions">
            <TimelineSubmitButton label="সংরক্ষণ করুন" />
            <button
              className="activity-button activity-button-danger"
              formAction={deleteAction}
            >
              মুছুন
            </button>
          </div>
          {state.message && (
            <p
              className={`activity-form-message ${state.status === "error" ? "is-error" : ""}`}
              role="status"
            >
              {state.message}
            </p>
          )}
        </form>
      </details>
    </article>
  );
}
