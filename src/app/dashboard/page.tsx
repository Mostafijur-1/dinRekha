import Link from "next/link";

import { Brand } from "@/components/brand";

export const metadata = {
  title: "Dashboard প্রস্তুত হচ্ছে",
};

export default function DashboardPlaceholder() {
  return (
    <main className="shell-page">
      <header className="shell-header">
        <Brand />
        <Link className="button button-quiet" href="/">
          হোমে ফিরুন
        </Link>
      </header>
      <section className="empty-state">
        <span>ভিত্তি প্রস্তুত</span>
        <h1>আপনার Dashboard এখানে তৈরি হবে।</h1>
        <p>
          এই মুহূর্তে অ্যাপের নিরাপদ ও নির্ভরযোগ্য ভিত্তি প্রস্তুত হয়েছে।
          পরবর্তী মাইলস্টোনে নির্ধারিত ফিচারগুলো একে একে যুক্ত হবে।
        </p>
        <Link className="button button-primary" href="/">
          পরিচিতি দেখুন
        </Link>
      </section>
    </main>
  );
}
