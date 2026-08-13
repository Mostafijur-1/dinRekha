import Link from "next/link";
import { redirect } from "next/navigation";

import { Brand } from "@/components/brand";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import {
  allowedDateKey,
  dateKeyForTimezone,
  parseDateKey,
  shiftDateKey,
} from "@/features/daily-activities/date";
import { ActivityCard } from "@/features/daily-activities/components/activity-card";
import { ActivityCreator } from "@/features/daily-activities/components/activity-creator";
import { listDailyActivities } from "@/features/daily-activities/repository";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "আজকের Daily Activities" };
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    const callbackUrl = date
      ? `/dashboard?date=${encodeURIComponent(date)}`
      : "/dashboard";
    redirect(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const now = new Date();
  const todayKey = dateKeyForTimezone(now, user.timezone);
  const dateKey = allowedDateKey(date, todayKey);
  const selectedDate = parseDateKey(dateKey)!;
  const previousDate = shiftDateKey(dateKey, -1)!;
  const nextDate = shiftDateKey(dateKey, 1)!;
  const isToday = dateKey === todayKey;
  const activities = await listDailyActivities(user.id, dateKey);
  const completed = activities.filter((activity) => activity.completed).length;
  const completion = activities.length
    ? Math.round((completed / activities.length) * 100)
    : 0;
  const dateLabel = new Intl.DateTimeFormat("bn-BD", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(selectedDate);

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
            <h1>{isToday ? "আজকের" : "নির্বাচিত দিনের"} Daily Activities</h1>
            <p>ছোট ছোট কাজের অগ্রগতি রাখুন—দ্রুত, ব্যক্তিগত এবং নিজের ছন্দে।</p>
          </div>
          <div
            className="dashboard-score"
            aria-label={`${dateLabel}: ${completion}% সম্পন্ন`}
          >
            <strong>{completion}%</strong>
            <span>
              {completed} / {activities.length} সম্পন্ন
            </span>
          </div>
        </section>

        <nav className="dashboard-date-nav" aria-label="দিন পরিবর্তন করুন">
          <Link href={`/dashboard?date=${previousDate}`}>← আগের দিন</Link>
          {!isToday && <Link href="/dashboard">আজ</Link>}
          {isToday ? (
            <span aria-disabled="true">পরের দিন →</span>
          ) : (
            <Link
              href={
                nextDate === todayKey
                  ? "/dashboard"
                  : `/dashboard?date=${nextDate}`
              }
            >
              পরের দিন →
            </Link>
          )}
        </nav>

        {isToday && <ActivityCreator />}

        {activities.length ? (
          <section className="daily-grid" aria-label="আজকের Activity তালিকা">
            {activities.map((activity) => (
              <ActivityCard
                activity={activity}
                dateKey={dateKey}
                canManage={isToday}
                key={activity.id}
              />
            ))}
          </section>
        ) : (
          <section className="daily-empty">
            <span aria-hidden="true">✓</span>
            <h2>
              {isToday
                ? "প্রথম Daily Activity তৈরি করুন"
                : "এই দিনের জন্য কোনো Activity নেই"}
            </h2>
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
