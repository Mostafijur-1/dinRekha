"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void error.digest;
  }, [error]);
  return (
    <main className="shell-page">
      <section className="daily-empty">
        <span aria-hidden="true">!</span>
        <h1>কিছু একটা ঠিকমতো কাজ করেনি</h1>
        <p>
          আপনার data পরিবর্তন হয়েছে ধরে নেবেন না। আবার চেষ্টা করুন; সমস্যা থাকলে
          পরে ফিরে আসুন।
        </p>
        <button
          className="activity-button activity-button-primary"
          type="button"
          onClick={reset}
        >
          আবার চেষ্টা করুন
        </button>
      </section>
    </main>
  );
}
