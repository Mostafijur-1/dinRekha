import Link from "next/link";

import { Brand } from "@/components/brand";
import { ArrowIcon, CheckIcon, ClockIcon, SparkIcon } from "@/components/icons";

const dailyActivities = [
  { name: "সকালের হাঁটা", meta: "৩০ মিনিট", progress: "সম্পন্ন", done: true },
  { name: "গভীর মনোযোগ", meta: "২ / ৩ সেশন", progress: "৬৭%", done: false },
  { name: "বই পড়া", meta: "২০ মিনিট বাকি", progress: "৪০%", done: false },
];

const values = [
  {
    number: "০১",
    title: "দ্রুত লিখুন",
    body: "বারবার টাইপ নয়। পরিচিত কাজ, সাম্প্রতিক Activity আর সময়ভিত্তিক পরামর্শ থেকে এক ট্যাপে শুরু করুন।",
  },
  {
    number: "০২",
    title: "নিজের দিন বুঝুন",
    body: "দিনের Timeline, সম্পন্ন কাজ আর সময়ের বণ্টন—সবকিছু এক জায়গায় পরিষ্কারভাবে দেখুন।",
  },
  {
    number: "০৩",
    title: "নিয়ন্ত্রণ আপনার",
    body: "আপনার Activity ব্যক্তিগত। কী রাখবেন, কাকে কতটুকু দেখাবেন—সেই সিদ্ধান্তও শুধু আপনার।",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero-shell">
        <nav className="site-nav" aria-label="প্রধান নেভিগেশন">
          <Brand />
          <div className="nav-actions">
            <a className="nav-link" href="#কেন-দিনরেখা">
              কেন দিনরেখা
            </a>
            <Link className="button button-quiet" href="/auth/sign-in">
              প্রবেশ করুন
            </Link>
          </div>
        </nav>

        <div className="hero-grid page-width">
          <div className="hero-copy">
            <div className="eyebrow">
              <SparkIcon />
              সময় ও অভ্যাস—একটি পরিষ্কার রেখায়
            </div>
            <h1>
              দিন কোথায় গেল,
              <span> রেখায় দেখুন।</span>
            </h1>
            <p className="hero-description">
              Timeline-এ সময় লিখুন, Daily Activity-তে অভ্যাস ধরে রাখুন। দিনরেখা
              আপনার দিনকে বিচার করে না—শুধু পরিষ্কারভাবে দেখতে সাহায্য করে।
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/auth/sign-up">
                বিনামূল্যে শুরু করুন
                <ArrowIcon />
              </Link>
              <span className="supporting-note">
                বিনামূল্যে শুরু করুন · কোনো কার্ড লাগবে না
              </span>
            </div>
          </div>

          <div
            className="product-preview"
            aria-label="দিনরেখা Dashboard-এর নমুনা"
          >
            <div className="preview-topbar">
              <div>
                <p>আজ, ১৩ আগস্ট</p>
                <strong>শুভ সকাল, রাফি</strong>
              </div>
              <span className="avatar" aria-hidden="true">
                র
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
              <strong>Daily Activities</strong>
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
            <p>সময় লিখুন, অভ্যাস দেখুন, দিন বুঝুন</p>
            <h2>দিনের হিসাব রাখা সহজ, ব্যক্তিগত এবং শান্ত।</h2>
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
            Google দিয়ে নিরাপদ প্রবেশ, server-side authorization এবং
            owner-scoped data access—দিনরেখা আপনার Activity ও note অন্য কারও
            সামনে প্রকাশ করে না।
          </p>
          <Link className="button button-primary" href="/auth/sign-up">
            নিজের দিনরেখা তৈরি করুন <ArrowIcon />
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
