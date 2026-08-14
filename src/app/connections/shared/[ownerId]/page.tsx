import { notFound, redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { listDailyActivities } from "@/features/daily-activities/repository";
import {
  dateKeyForTimezone,
  shiftDateKey,
} from "@/features/daily-activities/date";
import { minutesLabel } from "@/features/reports/format";
import { getProductivityReport } from "@/features/reports/repository";
import { authorizeSharedReport } from "@/features/sharing/repository";
import { currentMinuteForTimezone } from "@/features/timeline/time";
import { listTimelineEntries } from "@/features/timeline/repository";
import { findActiveUserById } from "@/features/auth/repositories/user-repository";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Shared progress" };
export const dynamic = "force-dynamic";

export default async function SharedProgressPage({
  params,
}: {
  params: Promise<{ ownerId: string }>;
}) {
  const { ownerId } = await params;
  const viewer = await getCurrentUser();
  if (!viewer)
    redirect(
      `/auth/sign-in?callbackUrl=${encodeURIComponent(`/connections/shared/${ownerId}`)}`,
    );
  const permissions = await authorizeSharedReport(ownerId, viewer.id);
  if (!permissions) notFound();
  const owner = await findActiveUserById(ownerId);
  if (!owner) notFound();
  const now = new Date();
  const todayKey = dateKeyForTimezone(now, owner.timezone);
  const dateKeys = Array.from({ length: 7 }, (_, index) =>
    shiftDateKey(todayKey, index - 6),
  ).filter((key): key is string => Boolean(key));
  const history = Array.from({ length: 31 }, (_, index) =>
    shiftDateKey(todayKey, index - 30),
  ).filter((key): key is string => Boolean(key));
  const [report, dailyActivities, timelineEntries] = await Promise.all([
    getProductivityReport(
      owner.id,
      dateKeys,
      todayKey,
      currentMinuteForTimezone(now, owner.timezone),
      history,
      {
        includeTimeline:
          permissions.productivitySummary || permissions.timeline,
        includeActivities:
          permissions.productivitySummary ||
          permissions.streaks ||
          permissions.dailyActivities,
      },
    ),
    permissions.dailyActivities
      ? listDailyActivities(owner.id, todayKey)
      : Promise.resolve([]),
    permissions.timeline
      ? listTimelineEntries(owner.id, todayKey)
      : Promise.resolve([]),
  ]);
  if (!report) notFound();
  return (
    <main className="shell-page">
      <header className="shell-header">
        <Brand />
      </header>
      <section className="shared-progress-page">
        <span>আপনার সঙ্গে share করা</span>
        <h1>{owner.name}-এর অগ্রগতি</h1>
        <p>শুধু তিনি যে permission দিয়েছেন সেটুকুই দেখা যাচ্ছে।</p>
        {permissions.productivitySummary && (
          <div className="report-metric-grid">
            <article className="report-score-card">
              <span>Productivity Score</span>
              <strong>
                {report.weekly.score === null ? "—" : `${report.weekly.score}%`}
              </strong>
              <p>শেষ ৭ দিনের target completion</p>
            </article>
            <article>
              <span>Track করা সময়</span>
              <strong>{minutesLabel(report.weekly.trackedMinutes)}</strong>
            </article>
          </div>
        )}
        {permissions.streaks && (
          <section className="connection-panel">
            <div className="feature-section-heading">
              <div>
                <span>Share করা streak</span>
                <h2>Activity consistency</h2>
              </div>
            </div>
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
                </article>
              ))}
            </div>
          </section>
        )}
        {permissions.dailyActivities && (
          <section className="connection-panel">
            <div className="feature-section-heading">
              <div>
                <span>আজকের share করা তথ্য</span>
                <h2>Daily Activities</h2>
              </div>
            </div>
            {dailyActivities.length ? (
              <div className="shared-data-list">
                {dailyActivities.map((activity) => (
                  <article key={activity.id}>
                    <span>
                      <strong>{activity.name}</strong>
                      <small>{activity.category}</small>
                    </span>
                    <strong>
                      {activity.value.toLocaleString("bn-BD")} /{" "}
                      {activity.target.toLocaleString("bn-BD")}
                      {activity.unit ? ` ${activity.unit}` : ""}
                    </strong>
                  </article>
                ))}
              </div>
            ) : (
              <p className="report-empty">আজকের কোনো Daily Activity নেই।</p>
            )}
          </section>
        )}
        {permissions.timeline && (
          <section className="connection-panel">
            <div className="feature-section-heading">
              <div>
                <span>আজকের share করা তথ্য</span>
                <h2>Timeline</h2>
              </div>
            </div>
            {timelineEntries.length ? (
              <div className="shared-data-list">
                {timelineEntries.map((entry) => (
                  <article key={entry.id}>
                    <span>
                      <strong>{entry.activity}</strong>
                      <small>{entry.category}</small>
                    </span>
                    <time>
                      {entry.startTime}
                      {entry.endTime ? ` – ${entry.endTime}` : " – চলছে"}
                    </time>
                  </article>
                ))}
              </div>
            ) : (
              <p className="report-empty">আজকের Timeline-এ কোনো entry নেই।</p>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
