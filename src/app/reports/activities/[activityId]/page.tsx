import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AppNavigation } from "@/components/app-navigation";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import {
  dateKeyForTimezone,
  shiftDateKey,
} from "@/features/daily-activities/date";
import { activityValueLabel, reportDateLabel } from "@/features/reports/format";
import { getActivityHistory } from "@/features/reports/repository";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Activity-এর ইতিহাস" };
export const dynamic = "force-dynamic";

export default async function ActivityHistoryPage({
  params,
}: {
  params: Promise<{ activityId: string }>;
}) {
  const { activityId } = await params;
  const user = await getCurrentUser();
  const callbackUrl = `/reports/activities/${activityId}`;
  if (!user)
    redirect(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);

  const todayKey = dateKeyForTimezone(new Date(), user.timezone);
  const dateKeys = Array.from({ length: 31 }, (_, index) =>
    shiftDateKey(todayKey, index - 30),
  ).filter((dateKey): dateKey is string => Boolean(dateKey));
  const history = await getActivityHistory(
    user.id,
    activityId,
    dateKeys,
    todayKey,
  );
  if (!history) notFound();
  const { activity } = history;

  return (
    <main className="shell-page app-shell reports-page">
      <AppNavigation active="reports" />
      <div className="app-main">
        <header className="shell-header app-header">
          <div className="app-mobile-brand">
            <Brand />
          </div>
          <div className="app-header-context">
            <span>Activity-এর ইতিহাস</span>
            <strong>{activity.name}</strong>
          </div>
          <div className="shell-account">
            <span>{user.name}</span>
            <SignOutButton />
          </div>
        </header>

        <div className="reports-layout activity-history-layout">
          <Link className="report-back-link" href="/reports">
            ← Report-এ ফিরুন
          </Link>
          <section className="reports-intro">
            <span>{activity.category}</span>
            <h1>{activity.name}</h1>
            <p>
              {activity.description ??
                "শেষ ৩০ দিনের target ও অগ্রগতির বিস্তারিত চিত্র।"}
            </p>
          </section>

          <section className="report-metric-grid" aria-label="Activity সারাংশ">
            <article className="report-score-card">
              <span>Consistency</span>
              <strong>
                {history.consistency === null ? "—" : `${history.consistency}%`}
              </strong>
              <p>
                {history.completedDays.toLocaleString("bn-BD")}টি পূরণ ÷{" "}
                {history.scheduledDays.toLocaleString("bn-BD")}টি নির্ধারিত দিন
              </p>
            </article>
            <article>
              <span>Current streak</span>
              <strong>
                {history.currentStreak.toLocaleString("bn-BD")} দিন
              </strong>
              <p>আজ অসম্পূর্ণ থাকলে গতকাল পর্যন্ত streak রাখা হয়েছে।</p>
            </article>
            <article>
              <span>৩০ দিনের সেরা streak</span>
              <strong>{history.bestStreak.toLocaleString("bn-BD")} দিন</strong>
              <p>শুধু নির্ধারিত occurrence গণনা করা হয়েছে।</p>
            </article>
          </section>

          <section className="report-panel">
            <div className="feature-section-heading">
              <div>
                <span>৩০ দিনের trend</span>
                <h2>Target progress</h2>
              </div>
              <p>
                Target:{" "}
                {activityValueLabel(
                  activity.target,
                  activity.measurement,
                  activity.unit,
                )}
              </p>
            </div>
            <div className="activity-history-chart">
              {history.days.map((day) => (
                <article
                  className={
                    !day.scheduled
                      ? "is-off-day"
                      : day.completed
                        ? "is-complete"
                        : ""
                  }
                  key={day.dateKey}
                >
                  <div className="activity-history-bar" aria-hidden="true">
                    <span
                      style={{
                        height: `${day.scheduled ? Math.max(4, day.percentage) : 0}%`,
                      }}
                    />
                  </div>
                  <strong>
                    {day.scheduled
                      ? activityValueLabel(
                          day.value,
                          activity.measurement,
                          activity.unit,
                        )
                      : "ছুটি"}
                  </strong>
                  <time dateTime={day.dateKey}>
                    {reportDateLabel(day.dateKey)}
                  </time>
                </article>
              ))}
            </div>
          </section>

          <aside className="report-explanation">
            <strong>এই trend কী বোঝায়?</strong>
            <p>
              প্রতিটি bar সেই দিনের value-এর target পূরণের অনুপাত। সবুজ bar
              target পূরণ বোঝায়; “ছুটি” আপনার schedule-এ Activity নির্ধারিত ছিল
              না।
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
