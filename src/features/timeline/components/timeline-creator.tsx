"use client";

import { useActionState, useEffect, useRef } from "react";

import { initialTimelineActionState } from "@/features/timeline/action-state";
import { createTimelineEntryAction } from "@/features/timeline/actions";
import { TimelineFields } from "@/features/timeline/components/timeline-fields";
import { TimelineSubmitButton } from "@/features/timeline/components/timeline-submit-button";

export function TimelineCreator({
  dateKey,
  isToday,
}: {
  dateKey: string;
  isToday: boolean;
}) {
  const [state, action] = useActionState(
    createTimelineEntryAction,
    initialTimelineActionState,
  );
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "success") form.current?.reset();
  }, [state.status]);

  return (
    <details className="timeline-creator">
      <summary>
        <span aria-hidden="true">+</span> Timeline-এ Activity যোগ করুন
      </summary>
      <form action={action} ref={form} className="timeline-form">
        <input type="hidden" name="dateKey" value={dateKey} />
        <TimelineFields allowInProgress={isToday} />
        <TimelineSubmitButton label="Entry যোগ করুন" />
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
  );
}
