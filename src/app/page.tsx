import Link from "next/link";

import { Brand } from "@/components/brand";
import { ArrowIcon, CheckIcon, ClockIcon, SparkIcon } from "@/components/icons";
import { InstallControl } from "@/features/pwa/install-control";
import { getCurrentUser } from "@/lib/auth";

const dailyActivities = [
  { name: "সকালের হাঁটা", meta: "৩০ মিনিট", progress: "সম্পন্ন", done: true },
  { name: "গভীর মনোযোগ", meta: "২ / ৩ সেশন", progress: "৬৭%", done: false },
  { name: "বই পড়া", meta: "২০ মিনিট বাকি", progress: "৪০%", done: false },
];

const values = [
  {
    number: "০১",
    title: "দ্রুত লিখুন",
    body: "বারবার টাইপ নয়। পরিচিত কাজ, সাম্প্রতিক অভ্যাস আর সময়ভিত্তিক পরামর্শ থেকে এক ট্যাপে শুরু করুন।",
  },
  {
    number: "০২",
    title: "নিজের দিন বুঝুন",
    body: "দিনের সময়রেখা, সম্পন্ন কাজ আর সময়ের বণ্টন—সবকিছু এক জায়গায় পরিষ্কারভাবে দেখুন।",
  },
  {
    number: "০৩",
    title: "নিয়ন্ত্রণ আপনার",
    body: "আপনার কাজ ও অভ্যাস ব্যক্তিগত। কী রাখবেন, কাকে কতটুকু দেখাবেন—সেই সিদ্ধান্তও শুধু আপনার।",
  },
];

type HomeUser = { name: string; timezone: string } | null;

function welcomeFor(user: HomeUser, now = new Date()) {
  if (!user) return "স্বাগতম";
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hour12: false,
      timeZone: user.timezone,
    }).format(now),
  );
  const greeting =
    hour < 12 ? "শুভ সকাল" : hour < 18 ? "শুভ বিকেল" : "শুভ সন্ধ্যা";
  return `${greeting}, ${user.name}`;
}

export function HomeContent({ user }: { user: HomeUser }) {
  const isSignedIn = Boolean(user);
  const welcome = welcomeFor(user);
  const primaryHref = isSignedIn ? "/dashboard" : "/auth/sign-up";
  const primaryLabel = isSignedIn ? "আজকের দিন দেখুন" : "Google দিয়ে শুরু করুন";

  return (
    <main>
      <section className="hero-shell">
        <nav className="site-nav" aria-label="প্রধান নেভিগেশন">
          <Brand />
          <div className="nav-actions">
            <a className="nav-link" href="#কেন-দিনরেখা">
              কেন দিনরেখা
            </a>
            <Link
              className="button button-quiet"
              href={isSignedIn ? "/dashboard" : "/auth/sign-in"}
            >
              {isSignedIn ? "ড্যাশবোর্ড" : "প্রবেশ করুন"}
            </Link>
          </div>
        </nav>

        <div className="hero-grid page-width">
          <div className="hero-copy">
            <div className="eyebrow">
              <SparkIcon />
              {welcome}
            </div>
            <h1>
              প্রতিদিনের সময় ও অভ্যাস,
              <span> এক জায়গায় বুঝে নিন।</span>
            </h1>
            <p className="hero-description">
              কখন কী করলেন, কোন অভ্যাসটি এগোচ্ছে এবং কোথায় মনোযোগ দরকার—দিনরেখা
              সহজ ভাষায় আপনার দিনের পরিষ্কার ছবি দেখায়।
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href={primaryHref}>
                {primaryLabel}
                <ArrowIcon />
              </Link>
              <InstallControl compact />
              <span className="supporting-note">
                {isSignedIn
                  ? "আপনার তথ্য প্রস্তুত—আজকের জায়গা থেকেই শুরু করুন"
                  : "বিনামূল্যে · কোনো কার্ড বা আলাদা পাসওয়ার্ড লাগবে না"}
              </span>
            </div>
          </div>

          <div
            className="product-preview"
            aria-label="দিনরেখা Dashboard-এর নমুনা"
          >
            <div className="preview-topbar">
              <div>
                <p>আজকের দিন এক নজরে</p>
                <strong>{welcome}</strong>
              </div>
              <span className="avatar" aria-hidden="true">
                {user?.name.trim().charAt(0) || "দি"}
              </span>
            </div>

            <div className="preview-score-row">
              <div className="score-ring" aria-label="আজকের অগ্রগতি ৭২ শতাংশ">
                <span>৭২</span>
                <small>%</small>
              </div>
              <div className="score-copy">
                <span>আজকের অগ্রগতি</span>
                <strong>দিনটি এগোচ্ছে সুন্দরভাবে</strong>
                <p>৫টির মধ্যে ৩টি গুরুত্বপূর্ণ কাজ হয়েছে</p>
              </div>
            </div>

            <div className="preview-section-title">
              <strong>আজকের অভ্যাস</strong>
              <span>সব দেখুন</span>
            </div>
            <div className="activity-list">
              {dailyActivities.map((activity) => (
                <div className="activity-row" key={activity.name}>
                  <span
                    className={
                      activity.done
                        ? "activity-check is-done"
                        : "activity-check"
                    }
                  >
                    {activity.done && <CheckIcon />}
                  </span>
                  <span className="activity-name">
                    <strong>{activity.name}</strong>
                    <small>{activity.meta}</small>
                  </span>
                  <span
                    className={
                      activity.done
                        ? "activity-progress is-done"
                        : "activity-progress"
                    }
                  >
                    {activity.progress}
                  </span>
                </div>
              ))}
            </div>

            <div className="focus-card">
              <span className="focus-icon">
                <ClockIcon />
              </span>
              <span>
                <small>এখন চলছে</small>
                <strong>গভীর মনোযোগ</strong>
              </span>
              <time>৪২:১৮</time>
            </div>
          </div>
        </div>
        <div className="hero-glow" aria-hidden="true" />
      </section>

      <section className="value-section" id="কেন-দিনরেখা">
        <div className="page-width">
          <div className="section-heading">
            <p>সময় লিখুন · অভ্যাস দেখুন · নিজের ছন্দ বুঝুন</p>
            <h2>দিনের হিসাব রাখুন চাপ নয়, স্বচ্ছতা নিয়ে।</h2>
          </div>
          <div className="value-grid">
            {values.map((value) => (
              <article key={value.number}>
                <span>{value.number}</span>
                <h3>{value.title}</h3>
                <p>{value.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="trust-section">
        <div className="page-width trust-grid">
          <div>
            <span>আপনার তথ্য, আপনার নিয়ন্ত্রণে</span>
            <h2>ব্যক্তিগত দিন ব্যক্তিগতই থাকে।</h2>
          </div>
          <p>
            Google দিয়ে নিরাপদ প্রবেশ এবং প্রতিটি তথ্যের মালিকভিত্তিক
            অনুমতি—আপনি স্পষ্টভাবে অনুমতি না দিলে দিনরেখা আপনার কাজ, সময় বা
            ব্যক্তিগত নোট অন্য কাউকে দেখায় না।
          </p>
          <Link className="button button-primary" href={primaryHref}>
            {isSignedIn ? "নিজের অগ্রগতি দেখুন" : "নিজের দিনরেখা তৈরি করুন"}{" "}
            <ArrowIcon />
          </Link>
        </div>
      </section>

      <footer className="site-footer page-width">
        <Brand />
        <p>দিন কোথায় গেল—রেখায় দেখুন।</p>
        <span>© ২০২৬ দিনরেখা</span>
      </footer>
    </main>
  );
}

export default async function Home() {
  const user = await getCurrentUser();
  return <HomeContent user={user} />;
}
