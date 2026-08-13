import Link from "next/link";
import { Brand } from "@/components/brand";

export const metadata = { title: "সংযোগ নেই" };

export default function OfflinePage() {
  return (
    <main className="shell-page">
      <header className="shell-header">
        <Brand />
      </header>
      <section className="daily-empty">
        <span aria-hidden="true">↻</span>
        <h1>ইন্টারনেট সংযোগ নেই</h1>
        <p>
          ব্যক্তিগত data এই device-এর public cache-এ রাখা হয় না। সংযোগ ফিরলে
          আবার চেষ্টা করুন।
        </p>
        <Link
          className="activity-button activity-button-primary"
          href="/dashboard"
        >
          আবার চেষ্টা করুন
        </Link>
      </section>
    </main>
  );
}
