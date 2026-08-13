"use client";

import { useFormStatus } from "react-dom";

export function ActivitySubmitButton({
  idle,
  pending = "সংরক্ষণ হচ্ছে…",
  className = "activity-button activity-button-primary",
}: {
  idle: string;
  pending?: string;
  className?: string;
}) {
  const status = useFormStatus();
  return (
    <button className={className} type="submit" disabled={status.pending}>
      {status.pending ? pending : idle}
    </button>
  );
}
