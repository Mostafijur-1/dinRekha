# Vercel deployment

## Environments

- Local Development: `.env.local`
- Vercel Preview: pull request/feature branch deployment
- Vercel Production: `main` branch

বর্তমান foundation-এর একমাত্র variable `NEXT_PUBLIC_APP_URL`। Preview-তে সংশ্লিষ্ট
deployment URL এবং Production-এ canonical production URL দিতে হবে। এটি public variable;
secret নয়।

## Project settings

- Framework preset: Next.js
- Install command: `npm install` (default)
- Build command: `npm run build`
- Output directory: Next.js default
- Node.js version: 24.x
- Production branch: `main`

## Release checks

1. GitHub Actions সফল।
2. Vercel Preview build সফল।
3. Bangla text, responsive layout, navigation এবং security headers যাচাই।
4. Environment values Preview ও Production-এ আলাদাভাবে নিশ্চিত।
5. অনুমোদনের পর production branch-এ promote/merge।

GitHub-এ push হওয়া deployment success প্রমাণ করে না। Vercel dashboard বা deployment
URL আলাদাভাবে যাচাই করতে হবে।
