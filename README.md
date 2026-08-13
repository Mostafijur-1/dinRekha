# ছন্দ

ছন্দ একটি বাংলা-ভাষার ব্যক্তিগত productivity ও accountability platform। কাজ,
অভ্যাস, সময় এবং অগ্রগতি দ্রুত নোট করে নিজের দিনের পরিষ্কার ছবি বোঝাই এর লক্ষ্য।

## প্রযুক্তিগত ভিত্তি

- Next.js App Router ও React
- strict TypeScript
- Tailwind CSS
- Server Components by default
- Vitest, Testing Library ও Playwright
- Vercel deployment target
- MongoDB ও authentication পরবর্তী নির্ধারিত milestone-এ যুক্ত হবে

## স্থানীয়ভাবে চালানো

প্রয়োজন: Node.js 24 এবং npm।

```bash
npm install
copy .env.example .env.local
npm run dev
```

তারপর `http://localhost:3000` খুলুন।

## গুণমান যাচাই

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Playwright browser install করার পর E2E পরীক্ষা চালানো যায় (আগে production build থাকতে
হবে):

```bash
npx playwright install chromium
npm run test:e2e
```

## Environment

| Variable              | Visibility | Purpose                           |
| --------------------- | ---------- | --------------------------------- |
| `NEXT_PUBLIC_APP_URL` | Public     | Metadata ও canonical absolute URL |

আসল secret কখনো Git-এ commit করা যাবে না। নতুন variable যোগ হলে `.env.example`
এবং Vercel Development, Preview ও Production environments সমন্বিত রাখতে হবে।

## Branch ও deployment flow

`main` production branch। Feature branch বা pull request Vercel Preview তৈরি করবে।
CI সফল হওয়া, Preview যাচাই এবং অনুমোদনের পরই `main`-এ merge বা production promotion
করা উচিত। GitHub push এবং Vercel deployment আলাদা ঘটনা।

আরও তথ্যের জন্য [Architecture](docs/architecture.md) এবং
[Deployment](docs/deployment.md) দেখুন।
