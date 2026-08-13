import { redirect } from "next/navigation";

import { Brand } from "@/components/brand";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in?callbackUrl=/dashboard");

  return (
    <main className="shell-page">
      <header className="shell-header">
        <Brand />
        <div className="shell-account">
          <span>{user.name}</span>
          <SignOutButton />
        </div>
      </header>
      <section className="empty-state">
        <span>Account নিরাপদে প্রস্তুত</span>
        <h1>স্বাগতম, {user.name}।</h1>
        <p>
          আপনার ব্যক্তিগত Dashboard এখন সুরক্ষিত। পরবর্তী milestone-এ Daily
          Activities তৈরি ও প্রতিদিনের অগ্রগতি রাখার সুবিধা এখানে যুক্ত হবে।
        </p>
      </section>
    </main>
  );
}
