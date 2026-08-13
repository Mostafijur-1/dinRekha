# Vercel deployment

## Environments

- Local Development: `.env.local`
- Vercel Preview: pull request/feature branch deployment
- Vercel Production: `main` branch

সব variable ও placeholder `.env.example`-এ আছে। Preview ও Production-এ আলাদা MongoDB credentials,
Auth secret, OAuth callback URL এবং email key দিতে হবে। Google Console callback URL:

```text
https://<deployment-host>/api/auth/callback/google
```

Changing Preview hostname ব্যবহার করলে প্রতিটি অনুমোদিত callback host আলাদাভাবে configure করতে হবে।

## Project settings

- Framework preset: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: Next.js default
- Node.js version: 24.x
- Production branch: `main`
- Runtime: Node.js; MongoDB ও crypto flow Edge runtime নয়

## Release checks

1. GitHub Actions সফল।
2. Vercel Preview build সফল।
3. MongoDB network access Vercel থেকে অনুমোদিত এবং least-privilege database user ব্যবহৃত।
4. Google OAuth callback ও Resend verified sender পরীক্ষা করা।
5. Sign up, sign in, sign out, protected route ও password reset Preview-তে যাচাই করা।
6. অনুমোদনের পর production promotion।

GitHub push deployment success প্রমাণ করে না। Vercel deployment আলাদাভাবে যাচাই করতে হবে।
