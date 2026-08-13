import Link from "next/link";
import { Brand } from "@/components/brand";

export default function NotFoundPage() {
  return (
    <main className="shell-page">
      <header className="shell-header">
        <Brand />
      </header>
      <section className="daily-empty">
        <span aria-hidden="true">404</span>
        <h1>পাতাটি পাওয়া যায়নি</h1>
        <p>Linkটি ভুল, মেয়াদোত্তীর্ণ অথবা আপনার এখানে access নেই।</p>
        <Link
          className="activity-button activity-button-primary"
          href="/dashboard"
        >
          Dashboard-এ ফিরুন
        </Link>
      </section>
    </main>
  );
}
