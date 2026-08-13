import Link from "next/link";
import { redirect } from "next/navigation";

import { Brand } from "@/components/brand";
import { AppNavigation } from "@/components/app-navigation";
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
import { TimelineCreator } from "@/features/timeline/components/timeline-creator";
import { TimelineSection } from "@/features/timeline/components/timeline-section";
import {
  listTimelineEntries,
  listTimelineSuggestions,
} from "@/features/timeline/repository";
import { currentMinuteForTimezone } from "@/features/timeline/time";
import { getCurrentUser } from "@/lib/auth";
import { buildDashboardReminders } from "@/features/notifications/due";

export const metadata = { title: "আজকের Dashboard" };
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
  const currentMinute = currentMinuteForTimezone(now, user.timezone);
  const [activities, timelineEntries, timelineSuggestions] = await Promise.all([
    listDailyActivities(user.id, dateKey),
    listTimelineEntries(user.id, dateKey),
    listTimelineSuggestions(user.id, todayKey, currentMinute),
  ]);
  const completed = activities.filter((activity) => activity.completed).length;
  const completion = activities.length
    ? Math.round((completed / activities.length) * 100)
    : 0;
  const reminders = isToday
    ? buildDashboardReminders(user.reminders, activities, currentMinute)
    : [];
  const dateLabel = new Intl.DateTimeFormat("bn-BD", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(selectedDate);

  return (
    <main className="shell-page dashboard-page app-shell">
      <AppNavigation />
      <div className="app-main">
        <header className="shell-header app-header">
          <div className="app-mobile-brand">
            <Brand />
          </div>
          <div className="app-header-context">
            <span>ব্যক্তিগত Dashboard</span>
            <strong>{isToday ? "আজকের দিন" : dateLabel}</strong>
          </div>
          <div className="shell-account">
            <span>{user.name}</span>
            <SignOutButton />
          </div>
        </header>

        <div className="dashboard-layout">
          <section className="dashboard-intro">
            <div>
              <span>{dateLabel}</span>
              <h1>{isToday ? "আজকের দিনরেখা" : "নির্বাচিত দিনের দিনরেখা"}</h1>
              <p>
                সময় ও অভ্যাসের অগ্রগতি রাখুন—দ্রুত, ব্যক্তিগত এবং পরিষ্কারভাবে।
              </p>
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

          {reminders.length > 0 && (
            <aside
              className="dashboard-reminders"
              aria-labelledby="reminder-heading"
            >
              <div>
                <span>এখন খেয়াল করুন</span>
                <h2 id="reminder-heading">Reminder</h2>
              </div>
              <div className="dashboard-reminder-list">
                {reminders.map((reminder) => (
                  <article key={reminder.id}>
                    <strong>{reminder.title}</strong>
                    <span>{reminder.detail}</span>
                  </article>
                ))}
              </div>
            </aside>
          )}

          <div id="timeline" className="dashboard-anchor">
            <TimelineCreator
              dateKey={dateKey}
              isToday={isToday}
              currentMinute={currentMinute}
              suggestions={timelineSuggestions}
            />
            <TimelineSection
              entries={timelineEntries}
              dateKey={dateKey}
              boundary={isToday ? currentMinute : 1440}
              isToday={isToday}
            />
          </div>

          <section
            id="daily-activities"
            className="dashboard-anchor activity-section"
          >
            <div className="feature-section-heading">
              <div>
                <span>নিয়মিত অগ্রগতি</span>
                <h2>Daily Activities</h2>
              </div>
              <p>ছোট অভ্যাস ও লক্ষ্য—এক নজরে।</p>
            </div>

            {isToday && <ActivityCreator />}

            {activities.length ? (
              <section
                className="daily-grid"
                aria-label="আজকের Activity তালিকা"
              >
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
                  Done/Not Done, Counter, সময় বা Quantity—যেভাবে দরকার সেভাবে
                  target ঠিক করুন।
                </p>
              </section>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
