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
  startMinute,
  endMinute,
  isToday,
  boundary,
  suggestions,
  defaultActivity = "",
  defaultCategory = "সাধারণ",
  summary = "এই ঘণ্টায় কী করেছেন লিখুন",
}: {
  dateKey: string;
  startMinute: number;
  endMinute: number;
  isToday: boolean;
  boundary: number;
  suggestions: TimelineSuggestion[];
  defaultActivity?: string;
  defaultCategory?: string;
  summary?: string;
}) {
  const [state, action] = useActionState(
    createTimelineEntryAction,
    initialTimelineActionState,
  );
  const [activity, setActivity] = useState(defaultActivity);
  const [category, setCategory] = useState(defaultCategory);
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
    <details className="timeline-hour-entry">
      <summary>
        <span aria-hidden="true">+</span>
        {summary}
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
  const slots = [
    { startMinute: 0, endMinute: 300, isDefaultSleep: true },
    ...Array.from({ length: 19 }, (_, index) => {
      const startMinute = (index + 5) * 60;
      return {
        startMinute,
        endMinute: startMinute + 60,
        isDefaultSleep: false,
      };
    }),
  ];
  const hasEarlyEntry = entries.some(
    (entry) => entry.startMinute < 300 && (entry.endMinute ?? boundary) > 0,
  );
  const effectiveEntries = hasEarlyEntry
    ? entries
    : [defaultSleepEntry, ...entries];
  const gaps = timelineGaps(effectiveEntries, boundary).filter(
    (gap) => gap.endMinute > gap.startMinute,
  );
  const tracked = effectiveEntries.reduce(
    (total, entry) =>
      total +
      Math.max(
        0,
        Math.min(entry.endMinute ?? boundary, boundary) - entry.startMinute,
      ),
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
        {slots.map(({ startMinute, endMinute, isDefaultSleep }) => {
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
                    isToday={isToday}
                    key={entry.id}
                  />
                ))}
                {isDefaultSleep && !hasEarlyEntry ? (
                  <div className="timeline-default-sleep">
                    <div>
                      <span>বিশ্রাম · ডিফল্ট</span>
                      <h3>ঘুম</h3>
                      <small>
                        {isToday && boundary < 300
                          ? `${durationLabel(boundary)} চলছে`
                          : "৫ ঘণ্টা"}
                      </small>
                    </div>
                    <HourEntryForm
                      dateKey={dateKey}
                      startMinute={startMinute}
                      endMinute={endMinute}
                      isToday={isToday}
                      boundary={boundary}
                      suggestions={suggestions}
                      defaultActivity="ঘুম"
                      defaultCategory="বিশ্রাম"
                      summary="পরিবর্তন করুন"
                    />
                  </div>
                ) : isFuture ? (
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
                    startMinute={startMinute}
                    endMinute={endMinute}
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
