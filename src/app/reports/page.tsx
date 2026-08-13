import { redirect } from "next/navigation";

import { AppNavigation } from "@/components/app-navigation";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import {
  dateKeyForTimezone,
  shiftDateKey,
} from "@/features/daily-activities/date";
import { minutesLabel, reportDateLabel } from "@/features/reports/format";
import { getProductivityReport } from "@/features/reports/repository";
import { currentMinuteForTimezone } from "@/features/timeline/time";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "সাপ্তাহিক রিপোর্ট" };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?callbackUrl=%2Freports");

  const now = new Date();
  const todayKey = dateKeyForTimezone(now, user.timezone);
  const dateKeys = Array.from({ length: 7 }, (_, index) =>
    shiftDateKey(todayKey, index - 6),
  ).filter((dateKey): dateKey is string => Boolean(dateKey));
  const report = await getProductivityReport(
    user.id,
    dateKeys,
    todayKey,
    currentMinuteForTimezone(now, user.timezone),
  );
  if (!report) redirect("/dashboard");
  const maxTracked = Math.max(
    ...report.days.map((day) => day.trackedMinutes),
    1,
  );

  return (
    <main className="shell-page app-shell reports-page">
      <AppNavigation active="reports" />
      <div className="app-main">
        <header className="shell-header app-header">
          <div className="app-mobile-brand">
            <Brand />
          </div>
          <div className="app-header-context">
            <span>ব্যক্তিগত রিপোর্ট</span>
            <strong>শেষ ৭ দিনের চিত্র</strong>
          </div>
          <div className="shell-account">
            <span>{user.name}</span>
            <SignOutButton />
          </div>
        </header>

        <div className="reports-layout">
          <section className="reports-intro">
            <span>বাস্তব তথ্য · সহজ ব্যাখ্যা</span>
            <h1>আপনার সময় ও অগ্রগতি</h1>
            <p>
              Timeline এবং Daily Activity থেকে তৈরি—কোনো অনুমান বা গোপন scoring
              নয়।
            </p>
          </section>

          <section className="report-metric-grid" aria-label="সাপ্তাহিক সারাংশ">
            <article className="report-score-card">
              <span>Productivity Score</span>
              <strong>
                {report.weekly.score === null ? "—" : `${report.weekly.score}%`}
              </strong>
              <p>
                {report.weekly.plannedActivities
                  ? `${report.weekly.completedActivities.toLocaleString("bn-BD")}টি সম্পন্ন ÷ ${report.weekly.plannedActivities.toLocaleString("bn-BD")}টি নির্ধারিত`
                  : "Score দেখানোর মতো নির্ধারিত Activity নেই।"}
              </p>
            </article>
            <article>
              <span>মোট track করা সময়</span>
              <strong>{minutesLabel(report.weekly.trackedMinutes)}</strong>
              <p>শেষ ৭ দিনের Timeline entry থেকে।</p>
            </article>
            <article>
              <span>আজ track করা</span>
              <strong>{minutesLabel(report.today.trackedMinutes)}</strong>
              <p>
                {minutesLabel(report.today.untrackedMinutes)} এখনো track করা
                হয়নি।
              </p>
            </article>
          </section>

          <section className="report-panel">
            <div className="feature-section-heading">
              <div>
                <span>প্রতিদিনের তুলনা</span>
                <h2>সময় ও completion trend</h2>
              </div>
              <p>Bar = track করা সময়; নিচে target completion।</p>
            </div>
            <div className="report-day-chart">
              {report.days.map((day) => (
                <article key={day.dateKey}>
                  <div className="report-bar-track" aria-hidden="true">
                    <span
                      style={{
                        height: `${Math.max(4, (day.trackedMinutes / maxTracked) * 100)}%`,
                      }}
                    />
                  </div>
                  <strong>{minutesLabel(day.trackedMinutes)}</strong>
                  <span>
                    {day.score === null ? "Score নেই" : `${day.score}% সম্পন্ন`}
                  </span>
                  <time dateTime={day.dateKey}>
                    {reportDateLabel(day.dateKey)}
                  </time>
                </article>
              ))}
            </div>
          </section>

          <section className="report-panel">
            <div className="feature-section-heading">
              <div>
                <span>সময় কোথায় গেছে</span>
                <h2>Category অনুযায়ী বণ্টন</h2>
              </div>
              <p>শুধু track করা Timeline সময়।</p>
            </div>
            {report.categories.length ? (
              <div className="report-categories">
                {report.categories.map((item) => (
                  <article key={item.category}>
                    <div>
                      <strong>{item.category}</strong>
                      <span>
                        {minutesLabel(item.minutes)} · {item.percentage}%
                      </span>
                    </div>
                    <div className="report-category-track" aria-hidden="true">
                      <span style={{ width: `${item.percentage}%` }} />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="report-empty">
                <strong>এখনো track করা সময় নেই</strong>
                <p>
                  Timeline-এ entry যোগ করলে এখানে category অনুযায়ী বণ্টন দেখা
                  যাবে।
                </p>
              </div>
            )}
          </section>

          <aside className="report-explanation">
            <strong>Score কীভাবে হিসাব হয়েছে?</strong>
            <p>
              শেষ ৭ দিনে নির্ধারিত Daily Activity-গুলোর মধ্যে target পূরণ হওয়া
              Activity-এর শতাংশ। বিশ্রাম বা untracked সময় score কমায় না।
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
