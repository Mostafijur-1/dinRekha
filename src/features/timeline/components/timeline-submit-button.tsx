"use client";

import { useFormStatus } from "react-dom";

export function TimelineSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="activity-button activity-button-primary"
      disabled={pending}
    >
      {pending ? "সংরক্ষণ হচ্ছে…" : label}
    </button>
  );
}
