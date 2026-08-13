import type { TimelineEntryView } from "@/features/timeline/repository";
import { TimelineCard } from "@/features/timeline/components/timeline-card";
import {
  durationLabel,
  minuteToTime,
  timelineGaps,
} from "@/features/timeline/time";

export function TimelineSection({
  entries,
  dateKey,
  boundary,
  isToday,
}: {
  entries: TimelineEntryView[];
  dateKey: string;
  boundary: number;
  isToday: boolean;
}) {
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
          <span>২৪ ঘণ্টার চিত্র</span>
          <h2 id="timeline-heading">দিনের Timeline</h2>
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
      {entries.length ? (
        <div className="timeline-list">
          {entries.map((entry) => (
            <TimelineCard
              entry={entry}
              dateKey={dateKey}
              isToday={isToday}
              key={entry.id}
            />
          ))}
        </div>
      ) : (
        <div className="timeline-empty">
          <h3>এখনও কোনো Timeline entry নেই</h3>
          <p>কখন কী করেছেন যোগ করলে দিনের সময়ের চিত্র এখানে দেখা যাবে।</p>
        </div>
      )}
      {gaps.length > 0 && (
        <details className="timeline-gaps">
          <summary>Untracked সময় দেখুন</summary>
          <ul>
            {gaps.map((gap) => (
              <li key={`${gap.startMinute}-${gap.endMinute}`}>
                <span>
                  {minuteToTime(gap.startMinute)}–{minuteToTime(gap.endMinute)}
                </span>
                <strong>
                  {durationLabel(gap.endMinute - gap.startMinute)}
                </strong>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
