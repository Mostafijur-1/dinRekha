# ছন্দ

ছন্দ একটি বাংলা-ভাষার ব্যক্তিগত productivity ও accountability platform। কাজ, অভ্যাস,
সময় এবং অগ্রগতি দ্রুত নোট করে নিজের দিনের পরিষ্কার ছবি বোঝাই এর লক্ষ্য।

## প্রযুক্তিগত ভিত্তি

- Next.js App Router ও React
- strict TypeScript ও Tailwind CSS
- Server Components by default
- Official MongoDB Node.js driver
- NextAuth দিয়ে শুধু Google authentication
- Vitest, Testing Library ও Playwright
- Vercel deployment target

## স্থানীয়ভাবে চালানো

প্রয়োজন: Node.js 24, npm এবং MongoDB।

```bash
npm install
copy .env.example .env.local
npm run dev
```

তারপর `http://localhost:3000` খুলুন। `.env.local`-এ placeholder-এর বদলে নিজের
development values দিতে হবে।

## গুণমান যাচাই

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Playwright browser install ও production build করার পর E2E পরীক্ষা চালানো যায়:

```bash
npx playwright install chromium
npm run test:e2e
```

## Environment

| Variable               | Visibility | Purpose                           |
| ---------------------- | ---------- | --------------------------------- |
| `NEXT_PUBLIC_APP_URL`  | Public     | Metadata ও canonical absolute URL |
| `MONGODB_URI`          | Secret     | MongoDB connection string         |
| `MONGODB_DB_NAME`      | Server     | Database name                     |
| `AUTH_SECRET`          | Secret     | Session signing/encryption secret |
| `NEXTAUTH_URL`         | Server     | Authentication-এর canonical URL   |
| `GOOGLE_CLIENT_ID`     | Server     | Google OAuth client ID            |
| `GOOGLE_CLIENT_SECRET` | Secret     | Google OAuth client secret        |

`NEXT_PUBLIC_APP_URL`-এ `https://example.com` অথবা `example.vercel.app`—দুই
format-ই গ্রহণযোগ্য। Variable-টি না থাকলে বর্তমান Vercel deployment-এর
`VERCEL_URL` ব্যবহার করা হয়।

আসল secret কখনো Git-এ commit করা যাবে না। Vercel Development, Preview ও Production
environment আলাদাভাবে configure করতে হবে।

## Branch ও deployment flow

`main` production branch। Feature branch বা pull request Vercel Preview তৈরি করবে। CI,
Preview যাচাই ও অনুমোদনের পরই production promotion করা উচিত। GitHub push এবং Vercel
deployment আলাদা ঘটনা।

আরও তথ্য:

- [Architecture](docs/architecture.md)
- [Authentication](docs/authentication.md)
- [Daily Activities](docs/daily-activities.md)
- [Deployment](docs/deployment.md)
