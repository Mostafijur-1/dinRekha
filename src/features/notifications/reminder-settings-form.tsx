"use client";

import { type FormEvent, useState } from "react";

import type { ReminderSettings } from "@/features/auth/repositories/user-repository";
import { initialSettingsActionState } from "@/features/settings/action-state";

export function ReminderSettingsForm({
  settings,
}: {
  settings: ReminderSettings;
}) {
  const [state, setState] = useState(initialSettingsActionState);
  const [pending, setPending] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState(initialSettingsActionState);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/settings/reminders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          activity: data.get("activity") === "on",
          endOfDay: data.get("endOfDay") === "on",
          dailySummary: data.get("dailySummary") === "on",
          streak: data.get("streak") === "on",
          endOfDayTime: data.get("endOfDayTime"),
          dailySummaryTime: data.get("dailySummaryTime"),
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setState({
        status: response.ok ? "success" : "error",
        message:
          result?.message ||
          "Reminder Settings সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।",
      });
    } catch {
      setState({
        status: "error",
        message: "Network সমস্যার কারণে সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।",
      });
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={save} className="settings-form reminder-settings-form">
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
