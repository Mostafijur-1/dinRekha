import { redirect } from "next/navigation";

import { AppNavigation } from "@/components/app-navigation";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { ProfileForm } from "@/features/settings/components/profile-form";
import { AccountDeletionForm } from "@/features/account/deletion-form";
import { ReminderSettingsForm } from "@/features/notifications/reminder-settings-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Profile ও Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?callbackUrl=%2Fsettings");
  return (
    <main className="shell-page app-shell settings-page">
      <AppNavigation active="settings" />
      <div className="app-main">
        <header className="shell-header app-header">
          <div className="app-mobile-brand">
            <Brand />
          </div>
          <div className="app-header-context">
            <span>ব্যক্তিগত Account</span>
            <strong>Profile ও Settings</strong>
          </div>
          <div className="shell-account">
            <span>{user.name}</span>
            <SignOutButton />
          </div>
        </header>
        <div className="settings-layout">
          <section className="reports-intro">
            <span>আপনার পরিচয় ও সময়</span>
            <h1>Settings</h1>
            <p>
              দিনরেখা আপনার দিন কোন timezone-এ বুঝবে এবং আপনাকে কী নামে দেখাবে
              তা ঠিক করুন।
            </p>
          </section>
          <div className="settings-grid">
            <section className="settings-card">
              <div className="feature-section-heading">
                <div>
                  <span>Editable</span>
                  <h2>Profile</h2>
                </div>
              </div>
              <ProfileForm name={user.name} timezone={user.timezone} />
            </section>
            <aside className="settings-card settings-identity">
              <span>Google account</span>
              <strong>{user.email}</strong>
              <p>
                Email ও sign-in identity Google থেকে আসে এবং এখানে পরিবর্তন করা
                যায় না।
              </p>
              <dl>
                <div>
                  <dt>Sign-in</dt>
                  <dd>Google OAuth</dd>
                </div>
                <div>
                  <dt>Account status</dt>
                  <dd>সক্রিয়</dd>
                </div>
              </dl>
              <div className="settings-export">
                <strong>আপনার data</strong>
                <p>
                  Profile, Daily Activities, progress এবং Timeline-এর JSON copy
                  download করুন।
                </p>
                <a
                  className="activity-button"
                  href="/api/account/export"
                  download
                >
                  Data export করুন
                </a>
              </div>
            </aside>
          </div>
          <section className="settings-card settings-reminders">
            <div className="feature-section-heading">
              <div>
                <span>আপনার নিয়ন্ত্রণে</span>
                <h2>Reminder</h2>
              </div>
            </div>
            <p>
              প্রতিটি ধরনের Reminder আলাদাভাবে নিয়ন্ত্রণ করুন। Browser
              notification delivery চালু না হলেও Dashboard-এ সময়মতো মনে করিয়ে
              দেওয়া হবে।
            </p>
            <ReminderSettingsForm settings={user.reminders} />
          </section>
          <section className="settings-danger-zone">
            <span>Danger zone</span>
            <h2>Account বন্ধ করুন</h2>
            <p>
              এটি আপনার সব session সঙ্গে সঙ্গে বন্ধ করবে এবং account-কে deletion
              review-এর জন্য নিষ্ক্রিয় করবে। এই ধাপে data hard-delete হয় না;
              প্রয়োজন হলে support-এর মাধ্যমে recovery সম্ভব। আগে Data export করে
              রাখুন।
            </p>
            <AccountDeletionForm email={user.email} />
          </section>
        </div>
      </div>
    </main>
  );
}
