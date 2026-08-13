import { redirect } from "next/navigation";

import { Brand } from "@/components/brand";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { dateKeyForTimezone } from "@/features/daily-activities/date";
import { ActivityCard } from "@/features/daily-activities/components/activity-card";
import { ActivityCreator } from "@/features/daily-activities/components/activity-creator";
import { listDailyActivities } from "@/features/daily-activities/repository";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "আজকের Daily Activities" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?callbackUrl=/dashboard");

  const now = new Date();
  const dateKey = dateKeyForTimezone(now, user.timezone);
  const activities = await listDailyActivities(user.id, dateKey);
  const completed = activities.filter((activity) => activity.completed).length;
  const completion = activities.length
    ? Math.round((completed / activities.length) * 100)
    : 0;
  const dateLabel = new Intl.DateTimeFormat("bn-BD", {
    timeZone: user.timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);

  return (
    <main className="shell-page dashboard-page">
      <header className="shell-header">
        <Brand />
        <div className="shell-account">
          <span>{user.name}</span>
          <SignOutButton />
        </div>
      </header>

      <div className="dashboard-layout">
        <section className="dashboard-intro">
          <div>
            <span>{dateLabel}</span>
            <h1>আজকের Daily Activities</h1>
            <p>ছোট ছোট কাজের অগ্রগতি রাখুন—দ্রুত, ব্যক্তিগত এবং নিজের ছন্দে।</p>
          </div>
          <div
            className="dashboard-score"
            aria-label={`আজ ${completion}% সম্পন্ন`}
          >
            <strong>{completion}%</strong>
            <span>
              {completed} / {activities.length} সম্পন্ন
            </span>
          </div>
        </section>

        <ActivityCreator />

        {activities.length ? (
          <section className="daily-grid" aria-label="আজকের Activity তালিকা">
            {activities.map((activity) => (
              <ActivityCard activity={activity} key={activity.id} />
            ))}
          </section>
        ) : (
          <section className="daily-empty">
            <span aria-hidden="true">✓</span>
            <h2>প্রথম Daily Activity তৈরি করুন</h2>
            <p>
              Done/Not Done, Counter, সময় বা Quantity—যেভাবে দরকার সেভাবে target
              ঠিক করুন।
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
