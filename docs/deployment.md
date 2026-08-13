# Vercel deployment

## Environments

- Local Development: `.env.local`
- Vercel Preview: pull request/feature branch deployment
- Vercel Production: `main` branch

সব variable ও placeholder `.env.example`-এ আছে। Preview ও Production-এ আলাদা MongoDB credentials,
Auth secret ও OAuth callback URL দিতে হবে। Google Console callback URL:

```text
https://<deployment-host>/api/auth/callback/google
```

Changing Preview hostname ব্যবহার করলে প্রতিটি অনুমোদিত callback host আলাদাভাবে configure করতে হবে।

Web Push ও scheduled Reminder delivery চালু করতে একই VAPID pair-এর
`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, একটি `mailto:`/HTTPS
`VAPID_SUBJECT` এবং কমপক্ষে ১৬ অক্ষরের `CRON_SECRET` প্রয়োজন। Secured dispatcher
endpoint হলো `/api/cron/notifications`; scheduler-কে প্রতি ৫ মিনিটে ওই path-এ
`Authorization: Bearer <CRON_SECRET>` পাঠাতে হবে। Vercel Hobby দিনে একবারের বেশি
Cron অনুমোদন করে না এবং এমন schedule deployment fail করায় repository-তে automatic
Cron enable করা হয়নি। Vercel Pro/Enterprise বা বিশ্বস্ত external scheduler ছাড়া
background Push delivery চালু হবে না; Dashboard Reminder এই scheduler-এর উপর নির্ভরশীল নয়।

`/api/health/ready` production readiness probe; MongoDB পাওয়া গেলে 200, না পেলে generic 503 দেয়।
Response ও structured log-এ `x-request-id` correlation থাকে এবং endpoint `no-store`।

## Project settings

- Framework preset: Next.js
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: Next.js default
- Node.js version: 24.x
- Production branch: `main`
- Runtime: Node.js; MongoDB flow Edge runtime নয়

## Release checks

1. GitHub Actions সফল।
2. Vercel Preview build সফল।
3. MongoDB network access Vercel থেকে অনুমোদিত এবং least-privilege database user ব্যবহৃত।
4. Google OAuth callback পরীক্ষা করা।
5. Google Sign up, Sign in, Sign out ও protected route Preview-তে যাচাই করা।
6. অনুমোদনের পর production promotion।

GitHub push deployment success প্রমাণ করে না। Vercel deployment আলাদাভাবে যাচাই করতে হবে।
