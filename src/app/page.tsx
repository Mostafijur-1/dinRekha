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
    title: "নিজের ছন্দ বুঝুন",
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
            <a className="nav-link" href="#কেন-ছন্দ">
              কেন ছন্দ
            </a>
            <Link className="button button-quiet" href="/dashboard">
              ডেমো দেখুন
            </Link>
          </div>
        </nav>

        <div className="hero-grid page-width">
          <div className="hero-copy">
            <div className="eyebrow">
              <SparkIcon />
              আপনার দিনের পরিষ্কার ছবি
            </div>
            <h1>
              সময় কোথায় যায়,
              <span> এবার দেখুন সহজে।</span>
            </h1>
            <p className="hero-description">
              কাজ, অভ্যাস ও মনোযোগের সময় দ্রুত নোট করুন। ছন্দ আপনাকে চাপ না
              দিয়ে প্রতিদিনের অগ্রগতি বুঝতে সাহায্য করে।
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/dashboard">
                আজকের দিন দেখুন
                <ArrowIcon />
              </Link>
              <span className="supporting-note">
                বিনামূল্যে শুরু করুন · কোনো কার্ড লাগবে না
              </span>
            </div>
          </div>

          <div className="product-preview" aria-label="ছন্দ ড্যাশবোর্ডের নমুনা">
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
                <strong>ভালো ছন্দে আছেন</strong>
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

      <section className="value-section" id="কেন-ছন্দ">
        <div className="page-width">
          <div className="section-heading">
            <p>দিন গুনবেন না, দিন বুঝবেন</p>
            <h2>Tracking যেন আরেকটি কাজ হয়ে না দাঁড়ায়।</h2>
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

      <footer className="site-footer page-width">
        <Brand />
        <p>নিজের সময়, নিজের ছন্দে।</p>
        <span>© ২০২৬ ছন্দ</span>
      </footer>
    </main>
  );
}
