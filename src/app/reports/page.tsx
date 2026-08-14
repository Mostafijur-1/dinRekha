import Link from "next/link";
import { redirect } from "next/navigation";

import { AppNavigation } from "@/components/app-navigation";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import {
  dateKeyForTimezone,
  shiftDateKey,
} from "@/features/daily-activities/date";
import {
  minutesLabel,
  reportDateLabel,
  reportRangeLabel,
} from "@/features/reports/format";
import { resolveReportRange } from "@/features/reports/range";
import { getProductivityReport } from "@/features/reports/repository";
import { currentMinuteForTimezone } from "@/features/timeline/time";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Productivity রিপোর্ট" };
export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; start?: string; end?: string }>;
}) {
  const query = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    const params = new URLSearchParams();
    if (query.range) params.set("range", query.range);
    if (query.start) params.set("start", query.start);
    if (query.end) params.set("end", query.end);
    const callbackUrl = params.size ? `/reports?${params}` : "/reports";
    redirect(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const now = new Date();
  const todayKey = dateKeyForTimezone(now, user.timezone);
  const range = resolveReportRange(query, todayKey);
  const dateKeys = range.dateKeys;
  const historyDateKeys = Array.from({ length: 31 }, (_, index) =>
    shiftDateKey(todayKey, index - 30),
  ).filter((dateKey): dateKey is string => Boolean(dateKey));
  const report = await getProductivityReport(
    user.id,
    dateKeys,
    todayKey,
    currentMinuteForTimezone(now, user.timezone),
    historyDateKeys,
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
            <strong>{reportRangeLabel(range.start, range.end)}</strong>
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

          <section
            className="report-range-controls"
            aria-label="Report-এর সময়সীমা"
          >
            <nav>
              <Link
                className={range.mode === "week" ? "is-active" : ""}
                href="/reports"
              >
                শেষ ৭ দিন
              </Link>
              <Link
                className={range.mode === "month" ? "is-active" : ""}
                href="/reports?range=month"
              >
                এই মাস
              </Link>
            </nav>
            <form action="/reports" method="get">
              <input type="hidden" name="range" value="custom" />
              <label>
                <span>শুরু</span>
                <input
                  type="date"
                  name="start"
                  max={todayKey}
                  defaultValue={
                    range.mode === "custom" ? range.start : undefined
                  }
                  required
                />
              </label>
              <label>
                <span>শেষ</span>
                <input
                  type="date"
                  name="end"
                  max={todayKey}
                  defaultValue={range.mode === "custom" ? range.end : todayKey}
                  required
                />
              </label>
              <button type="submit">Report দেখুন</button>
            </form>
            <small>Custom range সর্বোচ্চ ৯০ দিন।</small>
          </section>

          <section
            className="report-metric-grid"
            aria-label="নির্বাচিত সময়ের সারাংশ"
          >
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
              <p>
                {dateKeys.length.toLocaleString("bn-BD")} দিনের Timeline entry
                থেকে।
              </p>
            </article>
            <article>
              <span>
                {range.end === todayKey
                  ? "আজ track করা"
                  : `${reportDateLabel(range.end)} track করা`}
              </span>
              <strong>{minutesLabel(report.today.trackedMinutes)}</strong>
              <p>
                {minutesLabel(report.today.untrackedMinutes)} track করা হয়নি।
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
            <div
              className="report-day-chart report-range-chart"
              style={{
                gridTemplateColumns: `repeat(${dateKeys.length}, minmax(3.2rem, 1fr))`,
              }}
            >
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
                <span>অভ্যাসের ধারাবাহিকতা</span>
                <h2>Streak ও ৩০ দিনের consistency</h2>
              </div>
              <p>শুধু Activity-র নির্ধারিত দিনগুলো গণনা করা হয়েছে।</p>
            </div>
            {report.consistency.length ? (
              <div className="report-streaks">
                {report.consistency.map((item) => (
                  <article key={item.activityId}>
                    <div className="report-streak-heading">
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.category}</span>
                      </div>
                      <strong>
                        {item.currentStreak.toLocaleString("bn-BD")} দিন
                      </strong>
                    </div>
                    <div className="report-streak-stats">
                      <span>
                        Consistency{" "}
                        <strong>
                          {item.consistency === null
                            ? "—"
                            : `${item.consistency}%`}
                        </strong>
                      </span>
                      <span>
                        সেরা streak{" "}
                        <strong>
                          {item.bestStreak.toLocaleString("bn-BD")} দিন
                        </strong>
                      </span>
                      <span>
                        পূরণ{" "}
                        <strong>
                          {item.completedDays.toLocaleString("bn-BD")} /{" "}
                          {item.scheduledDays.toLocaleString("bn-BD")}
                        </strong>
                      </span>
                    </div>
                    <div
                      className="report-consistency-track"
                      aria-hidden="true"
                    >
                      <span style={{ width: `${item.consistency ?? 0}%` }} />
                    </div>
                    <Link
                      className="report-detail-link"
                      href={`/reports/activities/${item.activityId}`}
                    >
                      ৩০ দিনের বিস্তারিত দেখুন →
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="report-empty">
                <strong>Consistency দেখানোর মতো history নেই</strong>
                <p>Daily Activity ব্যবহার করলে এখানে streak তৈরি হবে।</p>
              </div>
            )}
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
              প্রতিটি নির্ধারিত Daily Activity target-এর যত শতাংশ পূরণ হয়েছে,
              তার গড়ই score। Target-এর বেশি অগ্রগতি ১০০% হিসেবেই ধরা হয়। বিশ্রাম
              বা untracked সময় score কমায় না।
            </p>
            <p>
              Current streak-এ আজকের target এখনো পূরণ না হলেও গতকাল পর্যন্ত
              চলমান streak ভাঙে না। Consistency-তে আজ বাদ দিয়ে শেষ ৩০টি সম্পূর্ণ
              দিনের নির্ধারিত Activity গণনা করা হয়।
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
