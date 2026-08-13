# Architecture

## উদ্দেশ্য

এই milestone শুধু production-ready foundation তৈরি করে। Authentication, MongoDB,
Timeline, Daily Activities এবং reporting ইচ্ছাকৃতভাবে এখনো যোগ করা হয়নি।

## Application boundary

- `src/app`: route, layout, metadata ও route-level composition
- `src/components`: পুনর্ব্যবহারযোগ্য, domain-neutral interface অংশ
- ভবিষ্যতে `src/features`: feature-specific UI, service, policy ও validation
- ভবিষ্যতে `src/lib`: database, authentication, security এবং shared infrastructure

Server Components default থাকবে। Browser state বা direct interaction দরকার হলেই কেবল
Client Component ব্যবহার করা হবে। Private data কখনো unsafe shared cache-এ রাখা হবে না।

## Bangla-only product decision

Application-এর একমাত্র interface language বাংলা। Locale route, translation dictionary
বা localization dependency নেই। Familiar product শব্দ—যেমন Dashboard, Timeline ও
Activity—প্রয়োজনে স্বাভাবিক বাংলা বাক্যের মধ্যে ব্যবহার করা হবে। এই সিদ্ধান্ত ১৩ আগস্ট
২০২৬-এর সরাসরি product direction অনুযায়ী Constitution-এর future English localization
প্রস্তুতির আগের নির্দেশকে প্রতিস্থাপন করে।

## Design system

Global semantic tokens canvas, surface, text, brand, border, radius এবং shadow নির্ধারণ
করে। Bengali-friendly system font stack remote font dependency ছাড়াই দ্রুত rendering
দেয়। Layout mobile-first, keyboard focus দৃশ্যমান এবং reduced-motion preference মানে।
Dark color tokens browser preference অনুযায়ী প্রস্তুত আছে।

## Security baseline

Next.js response headers clickjacking, MIME sniffing, unnecessary device permission এবং
overly broad referrer leakage সীমিত করে। Feature-level authentication, authorization,
CSRF strategy, rate limiting এবং Content Security Policy সংশ্লিষ্ট milestone-এ exact
data flow জানার পর যুক্ত হবে; অসম্পূর্ণ policy এখন অনুমান করে যোগ করা হয়নি।

## Testing strategy

- Vitest: pure logic ও দ্রুত unit tests
- Testing Library: component behavior এবং accessible contract
- Playwright: প্রধান browser journey, desktop ও mobile viewport
- GitHub Actions: format, lint, type-check, unit/component test এবং production build

## Architecture decisions

### Native Next.js on Vercel

Project Constitution অনুযায়ী native Next.js App Router ব্যবহার করা হয়েছে। কোনো
long-running custom server বা local filesystem persistence নেই।

### No database or authentication dependency yet

MongoDB driver এবং authentication architecture গুরুত্বপূর্ণ দীর্ঘমেয়াদি সিদ্ধান্ত।
তাদের নিজস্ব milestone-এর threat model ও data requirements ছাড়া dependency যোগ করা
scope expansion হতো।
