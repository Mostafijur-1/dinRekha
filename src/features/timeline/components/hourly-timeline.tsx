"use client";

import { useActionState, useState } from "react";

import { useCloseDetailsOnSuccess } from "@/components/use-close-details-on-success";
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
  timelineHourSlots,
  timelineGaps,
} from "@/features/timeline/time";

function HourEntryForm({
  dateKey,
  startMinute,
  endMinute,
  isToday,
  boundary,
  suggestions,
}: {
  dateKey: string;
  startMinute: number;
  endMinute: number;
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
  const detailsRef = useCloseDetailsOnSuccess(state);
  const isCurrentSlot =
    isToday && boundary >= startMinute && boundary < endMinute;
  const startTime = minuteToTime(startMinute);
  const endTime = isCurrentSlot ? "" : minuteToTime(Math.min(1439, endMinute));
  const hourSuggestions = suggestionsForTimelineHour(
    suggestions,
    dateKey,
    startMinute,
  );

  return (
    <details className="timeline-hour-entry" ref={detailsRef}>
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

const defaultSleepEntry: TimelineEntryView = {
  id: "default-sleep",
  activity: "ঘুম",
  category: "বিশ্রাম",
  startMinute: 0,
  endMinute: 300,
  startTime: "00:00",
  endTime: "05:00",
  status: "completed",
  duration: 300,
};

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
  const daytimeEntries = entries.filter((entry) => entry.startMinute >= 300);
  const effectiveEntries = [defaultSleepEntry, ...daytimeEntries];
  const gaps = timelineGaps(effectiveEntries, boundary).filter(
    (gap) => gap.endMinute > gap.startMinute,
  );
  const untracked = gaps.reduce(
    (total, gap) => total + gap.endMinute - gap.startMinute,
    0,
  );
  const tracked = Math.max(0, boundary - untracked);

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
        {timelineHourSlots.map(({ startMinute, endMinute, isDefaultSleep }) => {
          const startingEntries = daytimeEntries.filter(
            (entry) =>
              entry.startMinute >= startMinute && entry.startMinute < endMinute,
          );
          const isFuture = isToday && startMinute > boundary;
          const isCurrent =
            isToday && boundary >= startMinute && boundary < endMinute;

          return (
            <article
              className={`timeline-hour-slot ${isFuture ? "is-future" : ""} ${isCurrent ? "is-current" : ""}`}
              key={startMinute}
            >
              <div className="timeline-hour-label">
                <strong>
                  {isDefaultSleep ? "00:00–05:00" : minuteToTime(startMinute)}
                </strong>
                <span>
                  {isDefaultSleep
                    ? "রাতের বিশ্রাম"
                    : suggestedTimeLabel(startMinute)}
                </span>
              </div>
              <div className="timeline-hour-content">
                {startingEntries.map((entry) => (
                  <TimelineCard
                    entry={entry}
                    dateKey={dateKey}
                    key={entry.id}
                  />
                ))}
                {isDefaultSleep ? (
                  <div className="timeline-default-sleep">
                    <div>
                      <h3>ঘুম</h3>
                    </div>
                  </div>
                ) : isFuture ? (
                  <p className="timeline-hour-state">এই সময় এখনো আসেনি</p>
                ) : startingEntries.length === 0 ? (
                  <HourEntryForm
                    dateKey={dateKey}
                    startMinute={startMinute}
                    endMinute={endMinute}
                    isToday={isToday}
                    boundary={boundary}
                    suggestions={suggestions}
                  />
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
