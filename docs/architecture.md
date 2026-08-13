# Architecture

## Application boundary

- `src/app`: route, layout, metadata ও route-level composition
- `src/components`: reusable, domain-neutral interface
- `src/features`: feature UI, service, repository, policy ও validation
- `src/lib`: database, authentication, security ও shared infrastructure

Server Components default। Browser state বা direct interaction দরকার হলেই Client Component।
Private data unsafe shared cache-এ রাখা হয় না।

## Bangla-only product decision

Application-এর একমাত্র interface language বাংলা। Locale route, translation dictionary বা
localization dependency নেই। Dashboard, Timeline ও Activity-এর মতো পরিচিত product শব্দ স্বাভাবিক
বাংলা বাক্যে ব্যবহার করা যায়। ১৩ আগস্ট ২০২৬-এর সরাসরি product direction আগের future-English
localization নির্দেশকে প্রতিস্থাপন করেছে।

## Design system

Global semantic tokens canvas, surface, text, brand, border, radius ও shadow নির্ধারণ করে।
Bengali-friendly system font stack remote font dependency ছাড়াই দ্রুত rendering দেয়। Layout
mobile-first, keyboard focus দৃশ্যমান, reduced-motion preference মানে এবং dark-mode-ready।

## Database

Current official MongoDB Node.js driver centralized repository layer-এর পেছনে ব্যবহৃত। Vercel warm
invocation-এ connection promise ও bounded pool reuse হয়; failed connection cache হয় না। React
component সরাসরি database access করে না। Index definition code-owned এবং idempotent।

## Authentication

Stable NextAuth v4 OAuth/session protocol সামলায়। পুরোনো Mongo adapter-এর জন্য driver downgrade না
করে JWT session ও application-owned MongoDB repositories ব্যবহৃত হয়েছে। Protected request session
identity-এর পাশাপাশি active database user পুনরায় যাচাই করে। বিস্তারিত `docs/authentication.md`-এ।

## Security baseline

Response headers clickjacking, MIME sniffing, unnecessary device permission ও broad referrer leakage
সীমিত করে। Authentication boundary-তে Google-এর verified identity, OAuth state/CSRF controls,
secure cookie এবং server-only module boundaries আছে। Feature-level
authorization সংশ্লিষ্ট repository/service layer-এ থাকবে।

## Testing strategy

- Vitest: authorization logic ও repository contract
- Testing Library: component behavior ও accessible contract
- Playwright: প্রধান browser journey, desktop ও mobile
- GitHub Actions: format, lint, type-check, tests, production build ও E2E

## Deferred scope

Daily Activities ও recurrence slice সম্পন্ন; বিস্তারিত `docs/daily-activities.md`-এ। ২৪ ঘণ্টার
Timeline foundation এবং history-based quick suggestions-ও সম্পন্ন; বিস্তারিত `docs/timeline.md`-এ।
Daily/weekly Reports foundation explainable completion score, tracked time এবং category distribution
দেখায়। Recurrence-aware streak ও ৩০টি সম্পূর্ণ দিনের consistency একই pure report engine boundary-তে
হিসাব হয়; চলমান দিন অসম্পূর্ণ থাকলে আগের streak আগেভাগে ভাঙে না। Monthly reports, reminders,
offline sync ও user-facing account deletion এখনও ইচ্ছাকৃতভাবে যোগ হয়নি। প্রতিটি Activity-এর
owner-scoped dynamic report route ৩০ দিনের target/value trend দেখায়; definition না পেলে progress
query না চালিয়ে not-found response দেয়। Reports-এর week/month/custom range policy pure module-এ
থাকে; custom query সর্বোচ্চ ৯০ দিনে bounded এবং ভবিষ্যৎ end date ব্যবহারকারীর আজকের দিনে clamp হয়।

Settings-এর authenticated server action শুধু validated display name ও allowlisted IANA timezone update
করে। Google email/identity read-only এবং form payload দিয়ে পরিবর্তনযোগ্য নয়। Timezone পরিবর্তন পরের
request থেকে date/time boundary-তে কার্যকর হয়।

Account export route current session identity থেকে owner filter তৈরি করে এবং JSON attachment-এ profile,
Activity/progress ও Timeline data দেয়। OAuth identifiers, tokens, normalized email ও session security
fields বাদ থাকে; authenticated response private/no-store।

Account closure recoverable দুই-ধাপের lifecycle: exact current email confirmation-এর পর user status
`pending_deletion` হয় এবং sessionVersion বাড়ায়, ফলে সব session অকার্যকর হয়। Automated hard purge
retention policy ছাড়া চালু নয়; এই boundary accidental irreversible deletion এড়ায়।

Connections many-to-many canonical user pair দিয়ে model করা। Invitation-এর ১৯২-bit raw token শুধু
creator-এর response-এ ফেরে; database-এ SHA-256 hash, expiry ও single-use state থাকে। Connection নিজে
কোনো data access দেয় না—directional sharing policy আলাদা authorization layer।

Sharing policy প্রতি connection-এ owner→recipient direction-এ unique। Default policy সব false;
active connection ও explicit permission ছাড়া shared report query চলে না। বর্তমান targets শুধু aggregate
Productivity summary ও streaks; Timeline, category distribution, daily values এবং private notes share হয় না।

Reminder schedule user timezone-এ minute precision-এ নির্ধারিত। Activity-level preferred time এবং
user-level granular switches থেকে একই deterministic engine Dashboard reminder তৈরি করে; ভবিষ্যৎ Web Push
delivery-ও এই policy ব্যবহার করবে। `notificationDeliveries`-এর compound unique index retry-তে একই
user/kind/date/activity notification duplicate হওয়া আটকানোর persistence boundary তৈরি করে।

PWA service worker কেবল public landing shell, manifest ও icons cache করে; authenticated Dashboard,
Reports বা API response cache করে না। Push subscription প্রতি device endpoint-এ owner-scoped এবং Cron
VAPID-signed generic payload পাঠায়—Activity name বা private note lock screen/push provider-এ যায় না।
Dispatcher stateless এবং secured HTTP endpoint হিসেবে Vercel-compatible; পাঁচ মিনিটের delivery cadence
Vercel Pro/Enterprise বা external scheduler-এর deployment concern, application process-এর নয়।
