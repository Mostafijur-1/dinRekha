import { redirect } from "next/navigation";
import { AppNavigation } from "@/components/app-navigation";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { disconnectAction } from "@/features/connections/actions";
import { InviteCreator } from "@/features/connections/invite-creator";
import { listConnections } from "@/features/connections/repository";
import { updateSharingAction } from "@/features/sharing/actions";
import { getSharingPolicy } from "@/features/sharing/repository";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Connections" };
export const dynamic = "force-dynamic";

export default async function ConnectionsPage() {
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
            <strong>Connections</strong>
          </div>
          <div className="shell-account">
            <span>{user.name}</span>
            <SignOutButton />
          </div>
        </header>
        <div className="connections-layout">
          <section className="reports-intro">
            <span>আপনার নিয়ন্ত্রণে</span>
            <h1>বিশ্বস্ত মানুষের সঙ্গে connect করুন</h1>
            <p>
              Connection তৈরি হলেও কোনো progress নিজে থেকে share হয় না। প্রতিটি
              permission আপনি আলাদাভাবে ঠিক করবেন।
            </p>
          </section>
          <section className="connection-panel">
            <div className="feature-section-heading">
              <div>
                <span>Secure invite</span>
                <h2>নতুন Connection</h2>
              </div>
              <p>দিনে সর্বোচ্চ ১০টি; একসঙ্গে ৫টি active invite।</p>
            </div>
            <InviteCreator />
          </section>
          <section className="connection-panel">
            <div className="feature-section-heading">
              <div>
                <span>বর্তমান তালিকা</span>
                <h2>আপনার Connections</h2>
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
                        <span>আপনার data → {connection.name}</span>
                      </div>
                      <form action={updateSharing} className="sharing-form">
                        <label>
                          <input
                            type="checkbox"
                            name="productivitySummary"
                            defaultChecked={policy.productivitySummary}
                          />{" "}
                          Productivity summary
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="streaks"
                            defaultChecked={policy.streaks}
                          />{" "}
                          Activity streaks
                        </label>
                        <button className="activity-button" type="submit">
                          Permission সংরক্ষণ
                        </button>
                      </form>
                      <a
                        className="report-detail-link"
                        href={`/connections/shared/${connection.userId}`}
                      >
                        {connection.name} কী share করেছেন দেখুন →
                      </a>
                      <form action={disconnect}>
                        <button
                          className="activity-button activity-button-danger"
                          type="submit"
                        >
                          Disconnect
                        </button>
                      </form>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="report-empty">
                <strong>এখনো কোনো Connection নেই</strong>
                <p>Invite link তৈরি করে বিশ্বস্ত কাউকে পাঠান।</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
