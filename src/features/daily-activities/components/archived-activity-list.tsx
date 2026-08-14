import { restoreActivityAction } from "@/features/daily-activities/actions";
import { ActivitySubmitButton } from "@/features/daily-activities/components/activity-submit-button";
import type { ArchivedDailyActivityView } from "@/features/daily-activities/repository";

export function ArchivedActivityList({
  activities,
}: {
  activities: ArchivedDailyActivityView[];
}) {
  if (activities.length === 0) {
    return (
      <p className="settings-archive-empty">কোনো archived Activity নেই।</p>
    );
  }

  return (
    <div className="settings-archive-list">
      {activities.map((activity) => {
        const restore = restoreActivityAction.bind(null, activity.id);
        return (
          <article className="settings-archive-item" key={activity.id}>
            <div>
              <strong>{activity.name}</strong>
              <span>{activity.category}</span>
            </div>
            <form action={restore}>
              <ActivitySubmitButton
                className="activity-button activity-button-primary"
                idle="Restore"
                pending="Restore হচ্ছে…"
              />
            </form>
          </article>
        );
      })}
    </div>
  );
}
