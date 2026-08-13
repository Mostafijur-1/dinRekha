"use client";

import { useActionState } from "react";

import type { ReminderSettings } from "@/features/auth/repositories/user-repository";
import { updateReminderSettingsAction } from "@/features/notifications/actions";
import { initialSettingsActionState } from "@/features/settings/action-state";

export function ReminderSettingsForm({
  settings,
}: {
  settings: ReminderSettings;
}) {
  const [state, action, pending] = useActionState(
    updateReminderSettingsAction,
    initialSettingsActionState,
  );
  return (
    <form action={action} className="settings-form reminder-settings-form">
      <label className="activity-reminder-toggle">
        <input
          type="checkbox"
          name="activity"
          defaultChecked={settings.activity}
        />
        <span>Activity-এর পছন্দের সময়ের Reminder</span>
      </label>
      <label className="activity-reminder-toggle">
        <input
          type="checkbox"
          name="endOfDay"
          defaultChecked={settings.endOfDay}
        />
        <span>দিনশেষে Timeline পূরণের Reminder</span>
      </label>
      <label className="activity-field">
        <span>দিনশেষের সময়</span>
        <input
          type="time"
          name="endOfDayTime"
          defaultValue={settings.endOfDayTime}
        />
      </label>
      <label className="activity-reminder-toggle">
        <input
          type="checkbox"
          name="dailySummary"
          defaultChecked={settings.dailySummary}
        />
        <span>Daily Summary Reminder</span>
      </label>
      <label className="activity-field">
        <span>Summary-এর সময়</span>
        <input
          type="time"
          name="dailySummaryTime"
          defaultValue={settings.dailySummaryTime}
        />
      </label>
      <label className="activity-reminder-toggle">
        <input type="checkbox" name="streak" defaultChecked={settings.streak} />
        <span>Streak ঝুঁকিতে থাকলে Reminder</span>
      </label>
      <button
        className="activity-button activity-button-primary"
        type="submit"
        disabled={pending}
      >
        {pending ? "সংরক্ষণ হচ্ছে…" : "Reminder সংরক্ষণ করুন"}
      </button>
      {state.message && (
        <p
          className={`activity-form-message ${state.status === "error" ? "is-error" : ""}`}
          role="status"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
