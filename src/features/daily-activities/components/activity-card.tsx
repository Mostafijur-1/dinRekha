import {
  archiveActivityAction,
  setProgressAction,
} from "@/features/daily-activities/actions";
import { ActivityEditForm } from "@/features/daily-activities/components/activity-edit-form";
import { ActivitySubmitButton } from "@/features/daily-activities/components/activity-submit-button";
import type { DailyActivityView } from "@/features/daily-activities/repository";

function progressText(activity: DailyActivityView): string {
  if (activity.measurement === "boolean") {
    return activity.completed ? "সম্পন্ন" : "বাকি";
  }
  const unit =
    activity.unit || (activity.measurement === "counter" ? "বার" : "");
  return `${activity.value} / ${activity.target} ${unit}`.trim();
}

export function ActivityCard({ activity }: { activity: DailyActivityView }) {
  const setProgress = setProgressAction.bind(null, activity.id);
  const archive = archiveActivityAction.bind(null, activity.id);

  return (
    <article
      className={activity.completed ? "daily-card is-complete" : "daily-card"}
    >
      <div className="daily-card-main">
        <div className="daily-card-copy">
          <span>{activity.category}</span>
          <h2>{activity.name}</h2>
          {activity.description && <p>{activity.description}</p>}
        </div>
        <strong className="daily-progress-label">
          {progressText(activity)}
        </strong>
      </div>

      <div className="daily-progress-track" aria-hidden="true">
        <i
          style={{
            width: `${Math.min(100, (activity.value / activity.target) * 100)}%`,
          }}
        />
      </div>

      <div className="daily-card-actions">
        {activity.measurement === "boolean" ? (
          <form action={setProgress}>
            <input
              type="hidden"
              name="value"
              value={activity.completed ? 0 : 1}
            />
            <ActivitySubmitButton
              idle={activity.completed ? "আবার বাকি রাখুন" : "সম্পন্ন করুন"}
              pending="আপডেট হচ্ছে…"
            />
          </form>
        ) : activity.measurement === "counter" ? (
          <div className="counter-actions">
            <form action={setProgress}>
              <input
                type="hidden"
                name="value"
                value={Math.max(0, activity.value - 1)}
              />
              <ActivitySubmitButton
                idle="−"
                pending="…"
                className="activity-step-button"
              />
            </form>
            <span>{activity.value}</span>
            <form action={setProgress}>
              <input type="hidden" name="value" value={activity.value + 1} />
              <ActivitySubmitButton
                idle="＋"
                pending="…"
                className="activity-step-button"
              />
            </form>
          </div>
        ) : (
          <form action={setProgress} className="value-progress-form">
            <label>
              <span className="sr-only">আজকের অগ্রগতি</span>
              <input
                type="number"
                name="value"
                min="0"
                max="1000000"
                step="0.01"
                defaultValue={activity.value}
                required
              />
            </label>
            <ActivitySubmitButton idle="আপডেট" pending="…" />
          </form>
        )}

        <ActivityEditForm activity={activity} />
        <form action={archive}>
          <ActivitySubmitButton
            idle="Archive"
            pending="…"
            className="activity-button activity-button-danger"
          />
        </form>
      </div>
    </article>
  );
}
