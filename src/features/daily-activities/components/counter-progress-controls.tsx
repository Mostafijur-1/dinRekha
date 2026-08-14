"use client";

import { FormEvent, useRef, useState, useTransition } from "react";

import { setProgressAction } from "@/features/daily-activities/actions";

export function CounterProgressControls({
  activityId,
  dateKey,
  initialValue,
}: {
  activityId: string;
  dateKey: string;
  initialValue: number;
}) {
  const [value, setValue] = useState(String(initialValue));
  const [pending, startTransition] = useTransition();
  const valueRef = useRef(String(initialValue));
  const mutationQueue = useRef(Promise.resolve());

  function persist(requestedValue: number) {
    const nextValue = Math.min(
      1_000_000,
      Math.max(0, Math.round(requestedValue)),
    );
    valueRef.current = String(nextValue);
    setValue(valueRef.current);
    const formData = new FormData();
    formData.set("dateKey", dateKey);
    formData.set("value", String(nextValue));
    startTransition(async () => {
      mutationQueue.current = mutationQueue.current
        .catch(() => undefined)
        .then(() => setProgressAction(activityId, formData));
      await mutationQueue.current;
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    persist(Number(value) || 0);
  }

  return (
    <div className="counter-actions">
      <button
        aria-label="এক কমান"
        className="activity-step-button"
        disabled={Number(value) <= 0}
        onClick={() => persist((Number(valueRef.current) || 0) - 1)}
        type="button"
      >
        {pending ? "…" : "−"}
      </button>
      <form className="counter-direct-form" onSubmit={submit}>
        <label>
          <span className="sr-only">সরাসরি সংখ্যা লিখুন</span>
          <input
            type="number"
            name="value"
            min="0"
            max="1000000"
            step="1"
            value={value}
            inputMode="numeric"
            onChange={(event) => {
              valueRef.current = event.target.value;
              setValue(event.target.value);
            }}
            required
          />
        </label>
        <button className="activity-button" disabled={pending} type="submit">
          {pending ? "…" : "রাখুন"}
        </button>
      </form>
      <button
        aria-label="এক বাড়ান"
        className="activity-step-button"
        disabled={Number(value) >= 1_000_000}
        onClick={() => persist((Number(valueRef.current) || 0) + 1)}
        type="button"
      >
        {pending ? "…" : "＋"}
      </button>
    </div>
  );
}
