"use client";

import { useActionState, useState } from "react";

import { initialTimelineActionState } from "@/features/timeline/action-state";
import { createTimelineEntryAction } from "@/features/timeline/actions";
import { TimelineCard } from "@/features/timeline/components/timeline-card";
import { TimelineSubmitButton } from "@/features/timeline/components/timeline-submit-button";
import type { TimelineEntryView } from "@/features/timeline/repository";
import {
  suggestedTimeLabel,
  suggestionsForTimelineHour,
  type TimelineSuggestion,
} from "@/features/timeline/suggestions";
import {
  durationLabel,
  minuteToTime,
  timelineGaps,
} from "@/features/timeline/time";

function HourEntryForm({
  dateKey,
  hour,
  isToday,
  boundary,
  suggestions,
}: {
  dateKey: string;
  hour: number;
  isToday: boolean;
  boundary: number;
  suggestions: TimelineSuggestion[];
}) {
  const [state, action] = useActionState(
    createTimelineEntryAction,
    initialTimelineActionState,
  );
  const [activity, setActivity] = useState("");
  const [category, setCategory] = useState("সাধারণ");
  const startMinute = hour * 60;
  const endMinute = Math.min(1439, startMinute + 60);
  const isCurrentHour =
    isToday && boundary >= startMinute && boundary < startMinute + 60;
  const startTime = minuteToTime(startMinute);
  const endTime = isCurrentHour ? "" : minuteToTime(endMinute);
  const hourSuggestions = suggestionsForTimelineHour(
    suggestions,
    dateKey,
    startMinute,
  );

  return (
    <details className="timeline-hour-entry">
      <summary>
        <span aria-hidden="true">+</span>
        এই ঘণ্টায় কী করেছেন লিখুন
      </summary>
      <form action={action} className="timeline-hour-form">
        <input type="hidden" name="dateKey" value={dateKey} />
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="startTime" value={startTime} />
        <input type="hidden" name="endTime" value={endTime} />
        <input type="hidden" name="note" value="" />

        {hourSuggestions.length > 0 && (
          <div className="timeline-hour-suggestions">
            <span>এই সময়ে আগের কাজ থেকে সাজেশন</span>
            <div>
              {hourSuggestions.map((suggestion) => (
                <button
                  type="button"
                  key={`${suggestion.activity}-${suggestion.category}`}
                  onClick={() => {
                    setActivity(suggestion.activity);
                    setCategory(suggestion.category);
                  }}
                >
                  <strong>{suggestion.activity}</strong>
                  <small>{suggestion.category}</small>
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="activity-field timeline-hour-activity-field">
          <span>কী করেছেন?</span>
          <input
            name="activity"
            value={activity}
            onChange={(event) => {
              setActivity(event.target.value);
              setCategory("সাধারণ");
            }}
            maxLength={80}
            minLength={2}
            required
            placeholder="যেমন: বই পড়েছি"
            autoComplete="off"
          />
          <small>
            সময় স্বয়ংক্রিয়: {startTime}–{endTime || "এখন চলছে"}
          </small>
        </label>
        <TimelineSubmitButton label="Timeline-এ রাখুন" />
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

export function HourlyTimeline({
  entries,
  dateKey,
  boundary,
  isToday,
  suggestions,
}: {
  entries: TimelineEntryView[];
  dateKey: string;
  boundary: number;
  isToday: boolean;
  suggestions: TimelineSuggestion[];
}) {
  const hours = Array.from({ length: 24 }, (_, hour) => hour);
  const gaps = timelineGaps(entries, boundary).filter(
    (gap) => gap.endMinute > gap.startMinute,
  );
  const tracked = entries.reduce(
    (total, entry) =>
      total + Math.max(0, (entry.endMinute ?? boundary) - entry.startMinute),
    0,
  );
  const untracked = gaps.reduce(
    (total, gap) => total + gap.endMinute - gap.startMinute,
    0,
  );

  return (
    <section className="timeline-section" aria-labelledby="timeline-heading">
      <div className="timeline-heading">
        <div>
          <span>২৪ ঘণ্টা আগে থেকেই সাজানো</span>
          <h2 id="timeline-heading">ঘণ্টাভিত্তিক Timeline</h2>
          <p>যে ঘণ্টায় কাজটি করেছেন, সেই ঘণ্টা খুলে শুধু কাজের নাম লিখুন।</p>
        </div>
        <div className="timeline-stats">
          <span>
            <strong>{durationLabel(tracked)}</strong> tracked
          </span>
          <span>
            <strong>{durationLabel(untracked)}</strong> untracked
          </span>
        </div>
      </div>

      <div className="timeline-hour-list">
        {hours.map((hour) => {
          const startMinute = hour * 60;
          const endMinute = startMinute + 60;
          const startingEntries = entries.filter(
            (entry) =>
              entry.startMinute >= startMinute && entry.startMinute < endMinute,
          );
          const overlappingEntry = entries.find(
            (entry) =>
              entry.startMinute < endMinute &&
              (entry.endMinute ?? boundary) > startMinute,
          );
          const isFuture = isToday && startMinute > boundary;
          const isCurrent =
            isToday && boundary >= startMinute && boundary < endMinute;

          return (
            <article
              className={`timeline-hour-slot ${isFuture ? "is-future" : ""} ${isCurrent ? "is-current" : ""}`}
              key={hour}
            >
              <div className="timeline-hour-label">
                <strong>{minuteToTime(startMinute)}</strong>
                <span>{suggestedTimeLabel(startMinute)}</span>
              </div>
              <div className="timeline-hour-content">
                {startingEntries.map((entry) => (
                  <TimelineCard
                    entry={entry}
                    dateKey={dateKey}
                    isToday={isToday}
                    key={entry.id}
                  />
                ))}
                {isFuture ? (
                  <p className="timeline-hour-state">এই সময় এখনো আসেনি</p>
                ) : overlappingEntry ? (
                  startingEntries.length === 0 && (
                    <p className="timeline-hour-state">
                      আগের ঘণ্টার “{overlappingEntry.activity}” চলছে
                    </p>
                  )
                ) : (
                  <HourEntryForm
                    dateKey={dateKey}
                    hour={hour}
                    isToday={isToday}
                    boundary={boundary}
                    suggestions={suggestions}
                  />
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
