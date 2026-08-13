"use client";

import { useActionState, useEffect, useRef } from "react";

import { initialActivityActionState } from "@/features/daily-activities/action-state";
import { createActivityAction } from "@/features/daily-activities/actions";
import { ActivityDefinitionFields } from "@/features/daily-activities/components/activity-definition-fields";
import { ActivitySubmitButton } from "@/features/daily-activities/components/activity-submit-button";

export function ActivityCreator() {
  const [state, action] = useActionState(
    createActivityAction,
    initialActivityActionState,
  );
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") form.current?.reset();
  }, [state]);

  return (
    <details className="activity-creator">
      <summary>
        <span aria-hidden="true">＋</span>
        নতুন Daily Activity
      </summary>
      <form ref={form} action={action} className="activity-definition-form">
        <ActivityDefinitionFields />
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
        <ActivitySubmitButton idle="Activity তৈরি করুন" />
      </form>
    </details>
  );
}
