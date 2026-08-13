"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { initialTimelineActionState } from "@/features/timeline/action-state";
import { createTimelineEntryAction } from "@/features/timeline/actions";
import { TimelineFields } from "@/features/timeline/components/timeline-fields";
import { TimelineSubmitButton } from "@/features/timeline/components/timeline-submit-button";
import type { TimelineSuggestion } from "@/features/timeline/suggestions";
import { minuteToTime } from "@/features/timeline/time";

export function TimelineCreator({
  dateKey,
  isToday,
  currentMinute,
  suggestions,
}: {
  dateKey: string;
  isToday: boolean;
  currentMinute: number;
  suggestions: TimelineSuggestion[];
}) {
  const [state, action] = useActionState(
    createTimelineEntryAction,
    initialTimelineActionState,
  );
  const form = useRef<HTMLFormElement>(null);
  const [selected, setSelected] = useState<TimelineSuggestion>();
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
        {suggestions.length > 0 && (
          <div className="timeline-suggestions" aria-label="দ্রুত সাজেশন">
            <div>
              <strong>দ্রুত যোগ করুন</strong>
              <span>আপনার আগের কাজ থেকে</span>
            </div>
            <div className="timeline-suggestion-list">
              {suggestions.map((suggestion) => (
                <button
                  type="button"
                  key={`${suggestion.activity}-${suggestion.category}`}
                  className={
                    selected?.activity === suggestion.activity &&
                    selected.category === suggestion.category
                      ? "is-selected"
                      : undefined
                  }
                  onClick={() => setSelected(suggestion)}
                >
                  <strong>{suggestion.activity}</strong>
                  <span>
                    {suggestion.category} · {suggestion.reason}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        <TimelineFields
          key={selected ? `${selected.activity}-${selected.category}` : "empty"}
          allowInProgress={isToday}
          defaults={
            selected
              ? {
                  activity: selected.activity,
                  category: selected.category,
                  startTime: isToday ? minuteToTime(currentMinute) : undefined,
                }
              : undefined
          }
        />
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
