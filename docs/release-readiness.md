# Release readiness

## বাস্তবায়িত core

- Google-only authentication, protected routes ও session invalidation
- ২৪ ঘণ্টার Timeline, overlap validation, untracked gaps, history ও deterministic suggestions
- user-defined Daily Activities, recurrence, four measurement modes ও progress
- explainable Reports: day, week, month, custom range, streak ও Activity history
- many-to-many Connections, expiring single-use invitation ও directional default-deny sharing
- Profile/timezone, private export ও recoverable account closure
- granular Reminder, installable PWA, safe offline shell ও Web Push delivery foundation
- privacy-safe structured logging, error UX ও MongoDB readiness probe

## Deployment follow-up

- Vercel-এ Google OAuth, MongoDB, Auth, VAPID এবং Cron secrets configure করতে হবে।
- পাঁচ মিনিটের background Push cadence-এর জন্য Vercel Pro/Enterprise Cron বা বিশ্বস্ত external scheduler
  দরকার; Hobby plan-এর daily-only Cron এই use case পূরণ করে না।
- Vercel production deployment এবং signed-in Google/Push device flow remote environment-এ আলাদাভাবে
  smoke test করতে হবে। Git push deployment success-এর প্রমাণ নয়।

## ইচ্ছাকৃত future scope

- Offline mutation queue, conflict resolution ও background sync
- extensible special-domain Activity metadata
- selected Activity/category-level sharing beyond current aggregate summary/streak targets
- AI reflection/ranking; core product AI ছাড়া কার্যকর
- external error monitoring/analytics vendor, consent ও retention policy অনুমোদনের পরে

## CI reliability

Dependency installation registry/network failure-এর জন্য সর্বোচ্চ তিনটি bounded `npm ci` attempt ব্যবহার
করে। প্রতিটি attempt clean install; install সফল না হলে quality job থেমে যায় এবং কোনো test/build skip করে
success দেখানো হয় না।
