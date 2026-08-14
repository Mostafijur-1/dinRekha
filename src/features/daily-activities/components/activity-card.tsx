import {
  archiveActivityAction,
  reorderActivityAction,
  setProgressAction,
} from "@/features/daily-activities/actions";
import { ActivityEditForm } from "@/features/daily-activities/components/activity-edit-form";
import { ActivitySubmitButton } from "@/features/daily-activities/components/activity-submit-button";
import { CounterProgressControls } from "@/features/daily-activities/components/counter-progress-controls";
import type { DailyActivityView } from "@/features/daily-activities/repository";

function progressText(activity: DailyActivityView): string {
  if (activity.measurement === "boolean") {
    return activity.completed ? "সম্পন্ন" : "বাকি";
  }
  const unit =
    activity.unit || (activity.measurement === "counter" ? "বার" : "");
  return `${activity.value} / ${activity.target} ${unit}`.trim();
}

const dayLabels = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"];

function scheduleText(activity: DailyActivityView): string {
  if (activity.frequency === "daily") return "প্রতিদিন";
  return activity.days.map((day) => dayLabels[day]).join(" · ");
}

export function ActivityCard({
  activity,
  dateKey,
  canManage,
}: {
  activity: DailyActivityView;
  dateKey: string;
  canManage: boolean;
}) {
  const setProgress = setProgressAction.bind(null, activity.id);
  const archive = archiveActivityAction.bind(null, activity.id);
  const reorder = reorderActivityAction.bind(null, activity.id);

  return (
    <article
      className={activity.completed ? "daily-card is-complete" : "daily-card"}
    >
      <div className="daily-card-main">
        <div className="daily-card-copy">
          <span>{activity.category}</span>
          <h2>{activity.name}</h2>
          <small className="daily-schedule">{scheduleText(activity)}</small>
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
            <input type="hidden" name="dateKey" value={dateKey} />
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
          <CounterProgressControls
            activityId={activity.id}
            dateKey={dateKey}
            initialValue={activity.value}
          />
        ) : (
          <form action={setProgress} className="value-progress-form">
            <input type="hidden" name="dateKey" value={dateKey} />
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

        {canManage && (
          <>
            <ActivityEditForm activity={activity} />
            <div
              className="activity-order-actions"
              aria-label="Activity-এর ক্রম"
            >
              <form action={reorder}>
                <input type="hidden" name="dateKey" value={dateKey} />
                <input type="hidden" name="direction" value="up" />
                <ActivitySubmitButton
                  idle="↑"
                  pending="…"
                  className="activity-step-button"
                  disabled={!activity.canMoveUp}
                />
              </form>
              <form action={reorder}>
                <input type="hidden" name="dateKey" value={dateKey} />
                <input type="hidden" name="direction" value="down" />
                <ActivitySubmitButton
                  idle="↓"
                  pending="…"
                  className="activity-step-button"
                  disabled={!activity.canMoveDown}
                />
              </form>
            </div>
            <form action={archive}>
              <ActivitySubmitButton
                idle="Archive"
                pending="…"
                className="activity-button activity-button-danger"
              />
            </form>
          </>
        )}
      </div>
    </article>
  );
}
