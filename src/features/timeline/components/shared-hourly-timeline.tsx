import type { TimelineEntryView } from "@/features/timeline/repository";
import { minuteToTime, timelineHourSlots } from "@/features/timeline/time";
import { suggestedTimeLabel } from "@/features/timeline/suggestions";

export function SharedHourlyTimeline({
  entries,
  boundary,
}: {
  entries: TimelineEntryView[];
  boundary: number;
}) {
  const daytimeEntries = entries.filter((entry) => entry.startMinute >= 300);

  return (
    <div
      className="timeline-hour-list shared-timeline"
      aria-label="শেয়ার করা ঘণ্টাভিত্তিক Timeline"
    >
      {timelineHourSlots.map(({ startMinute, endMinute, isDefaultSleep }) => {
        const startingEntries = daytimeEntries.filter(
          (entry) =>
            entry.startMinute >= startMinute && entry.startMinute < endMinute,
        );
        const isFuture = startMinute > boundary;
        const isCurrent = boundary >= startMinute && boundary < endMinute;

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
              {isDefaultSleep ? (
                <div className="timeline-default-sleep">
                  <div>
                    <h3>ঘুম</h3>
                  </div>
                </div>
              ) : startingEntries.length > 0 ? (
                startingEntries.map((entry) => (
                  <article
                    className="timeline-card shared-timeline-card"
                    key={entry.id}
                  >
                    <div className="timeline-copy">
                      <h3>{entry.activity}</h3>
                      {entry.note && <p>{entry.note}</p>}
                    </div>
                  </article>
                ))
              ) : (
                <p className="timeline-hour-state">
                  {isFuture ? "এই সময় এখনো আসেনি" : "কোনো Activity যোগ হয়নি"}
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
