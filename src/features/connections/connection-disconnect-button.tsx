"use client";

export function ConnectionDisconnectButton({ name }: { name: string }) {
  return (
    <button
      className="activity-button activity-button-danger"
      onClick={(event) => {
        const confirmed = window.confirm(
          `${name}-এর সঙ্গে সংযোগ বিচ্ছিন্ন করবেন? আবার যুক্ত হতে নতুন Invitation প্রয়োজন হবে।`,
        );
        if (!confirmed) event.preventDefault();
      }}
      type="submit"
    >
      সংযোগ বিচ্ছিন্ন করুন
    </button>
  );
}
