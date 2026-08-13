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

Timeline, Daily Activities, reports ও user-facing account deletion এখনও ইচ্ছাকৃতভাবে যোগ হয়নি।
