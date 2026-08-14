"use client";

import { useActionState } from "react";

import { initialActivityActionState } from "@/features/daily-activities/action-state";
import { updateActivityAction } from "@/features/daily-activities/actions";
import { ActivityDefinitionFields } from "@/features/daily-activities/components/activity-definition-fields";
import { ActivitySubmitButton } from "@/features/daily-activities/components/activity-submit-button";
import type { DailyActivityView } from "@/features/daily-activities/repository";

export function ActivityEditForm({
  activity,
}: {
  activity: DailyActivityView;
}) {
  const update = updateActivityAction.bind(null, activity.id);
  const [state, action] = useActionState(update, initialActivityActionState);

  return (
    <details className="activity-edit">
      <summary>Edit</summary>
      <form action={action} className="activity-definition-form">
        <ActivityDefinitionFields activity={activity} />
        {state.message && (
          <p
            className={
              state.status === "error"
                ? "activity-form-message is-error"
                : "activity-form-message"
            }
            role="status"
          >
            {state.message}
          </p>
        )}
        <ActivitySubmitButton idle="পরিবর্তন সংরক্ষণ করুন" />
      </form>
    </details>
  );
}
