import { redirect } from "next/navigation";
import { AppNavigation } from "@/components/app-navigation";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { disconnectAction } from "@/features/connections/actions";
import { InviteCreator } from "@/features/connections/invite-creator";
import { InviteLinkOpener } from "@/features/connections/invite-link-opener";
import { listConnections } from "@/features/connections/repository";
import { updateSharingAction } from "@/features/sharing/actions";
import { getSharingPolicy } from "@/features/sharing/repository";
import { getCurrentUser } from "@/lib/auth";
import { publicEnv } from "@/lib/env";

export const metadata = { title: "সংযোগ" };
export const dynamic = "force-dynamic";

export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: "1" | "already" | "error" }>;
}) {
  const { connected } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?callbackUrl=%2Fconnections");
  const connections = await listConnections(user.id);
  const policies = new Map(
    await Promise.all(
      connections.map(
        async (connection) =>
          [
            connection.userId,
            await getSharingPolicy(user.id, connection.userId),
          ] as const,
      ),
    ),
  );
  return (
    <main className="shell-page app-shell connections-page">
      <AppNavigation active="connections" />
      <div className="app-main">
        <header className="shell-header app-header">
          <div className="app-mobile-brand">
            <Brand />
          </div>
          <div className="app-header-context">
            <span>ব্যক্তিগত নেটওয়ার্ক</span>
            <strong>সংযোগ</strong>
          </div>
          <div className="shell-account">
            <span>{user.name}</span>
            <SignOutButton />
          </div>
        </header>
        <div className="connections-layout">
          <section className="reports-intro">
            <span>আপনার নিয়ন্ত্রণে</span>
            <h1>বিশ্বস্ত মানুষের সঙ্গে যুক্ত হোন</h1>
            <p>
              সংযোগ তৈরি হলে সারাংশ, streak, আজকের Daily Activities ও Timeline
              share হবে। যেটি দেখাতে চান না, শুধু সেটির permission বন্ধ করে
              সংরক্ষণ করুন।
            </p>
          </section>
          <section className="connection-panel">
            <div className="feature-section-heading">
              <div>
                <span>নিরাপদ আমন্ত্রণ</span>
                <h2>নতুন সংযোগ</h2>
              </div>
              <p>দিনে সর্বোচ্চ ১০টি; একসঙ্গে ৫টি সক্রিয় আমন্ত্রণ।</p>
            </div>
            <InviteCreator appOrigin={publicEnv.appUrl.origin} />
            <div className="connection-invite-divider">
              <span>অথবা</span>
            </div>
            <InviteLinkOpener />
          </section>
          <section className="connection-panel">
            {connected === "1" && (
              <p className="connection-success" role="status">
                সংযোগ সফল হয়েছে। সব তথ্য share করা চালু আছে; প্রয়োজন হলে নিচে
                নির্দিষ্ট permission বন্ধ করুন।
              </p>
            )}
            {connected === "already" && (
              <p className="connection-success" role="status">
                এই ব্যক্তির সঙ্গে আপনার সংযোগ আগে থেকেই সক্রিয় আছে। নতুন কোনো
                সংযোগ তৈরি হয়নি।
              </p>
            )}
            {connected === "error" && (
              <p className="connection-error" role="alert">
                সংযোগটি সম্পন্ন করা যায়নি। লিংকটি ব্যবহৃত, বাতিল বা
                মেয়াদোত্তীর্ণ হতে পারে। নতুন লিংক নিয়ে আবার চেষ্টা করুন।
              </p>
            )}
            <div className="feature-section-heading">
              <div>
                <span>বর্তমান তালিকা</span>
                <h2>আপনার সংযোগগুলো</h2>
              </div>
              <p>{connections.length.toLocaleString("bn-BD")} জন</p>
            </div>
            {connections.length ? (
              <div className="connection-list">
                {connections.map((connection) => {
                  const disconnect = disconnectAction.bind(null, connection.id);
                  const updateSharing = updateSharingAction.bind(
                    null,
                    connection.userId,
                  );
                  const policy = policies.get(connection.userId)!;
                  return (
                    <article key={connection.id}>
                      <div>
                        <strong>{connection.name}</strong>
                        <span>আপনার তথ্য → {connection.name}</span>
                      </div>
                      <form action={updateSharing} className="sharing-form">
                        <label>
                          <input
                            type="checkbox"
                            name="productivitySummary"
                            defaultChecked={policy.productivitySummary}
                          />{" "}
                          কাজের অগ্রগতির সারাংশ
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="streaks"
                            defaultChecked={policy.streaks}
                          />{" "}
                          অভ্যাস ধরে রাখার ধারা
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="dailyActivities"
                            defaultChecked={policy.dailyActivities}
                          />{" "}
                          আজকের Daily Activities
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="timeline"
                            defaultChecked={policy.timeline}
                          />{" "}
                          আজকের Timeline
                        </label>
                        <button className="activity-button" type="submit">
                          অনুমতি সংরক্ষণ
                        </button>
                      </form>
                      <a
                        className="report-detail-link"
                        href={`/connections/shared/${connection.userId}`}
                      >
                        আপনার সংযোগ →
                      </a>
                      <form action={disconnect}>
                        <button
                          className="activity-button activity-button-danger"
                          type="submit"
                        >
                          সংযোগ বিচ্ছিন্ন করুন
                        </button>
                      </form>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="report-empty">
                <strong>এখনো কোনো সংযোগ নেই</strong>
                <p>আমন্ত্রণের লিংক তৈরি করে বিশ্বস্ত কাউকে পাঠান।</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
