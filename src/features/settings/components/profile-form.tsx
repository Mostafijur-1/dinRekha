"use client";

import { useActionState } from "react";

import { initialSettingsActionState } from "@/features/settings/action-state";
import { updateProfileAction } from "@/features/settings/actions";
import { supportedTimezones } from "@/features/settings/schema";

export function ProfileForm({
  name,
  timezone,
}: {
  name: string;
  timezone: string;
}) {
  const [state, action, pending] = useActionState(
    updateProfileAction,
    initialSettingsActionState,
  );
  return (
    <form action={action} className="settings-form">
      <label className="activity-field">
        <span>আপনার নাম</span>
        <input
          name="name"
          defaultValue={name}
          minLength={2}
          maxLength={80}
          required
        />
      </label>
      <label className="activity-field">
        <span>Timezone</span>
        <select name="timezone" defaultValue={timezone} required>
          {supportedTimezones.map((item) => (
            <option value={item.value} key={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <small>
          দিন, বর্তমান সময় এবং Report এই timezone অনুযায়ী হিসাব হবে।
        </small>
      </label>
      <button
        className="activity-button activity-button-primary"
        type="submit"
        disabled={pending}
      >
        {pending ? "সংরক্ষণ হচ্ছে…" : "পরিবর্তন সংরক্ষণ করুন"}
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
