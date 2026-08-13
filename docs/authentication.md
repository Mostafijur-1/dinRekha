# Authentication architecture

## Google-only প্রবেশ ও account তৈরি

`/auth/sign-in` এবং `/auth/sign-up` আলাদা user journey দেখায়, কিন্তু উভয় page একই Google OAuth provider ব্যবহার করে। প্রথমবার verified Google identity এলে application-owned MongoDB repository নতুন user এবং OAuth account record তৈরি করে। পরিচিত Google identity হলে সেই user-ই পুনরায় প্রবেশ করে। Email/password form, credentials endpoint, password reset এবং application থেকে email পাঠানোর ব্যবস্থা নেই।

Google provider configure না থাকলে OAuth button disabled থাকে এবং বাংলা configuration বার্তা দেখায়। Production-এ `GOOGLE_CLIENT_ID` ও `GOOGLE_CLIENT_SECRET` আবশ্যক।

## নিরাপদ Google linking

শুধু `email_verified=true` Google profile গ্রহণ করা হয়। `(provider, providerAccountId)` unique index একই Google identity-কে একাধিক user-এর সঙ্গে যুক্ত হতে দেয় না। একই normalized email-এর কোনো legacy account থাকলে সেটিতে verified ownership marker না থাকলে automatic linking প্রত্যাখ্যাত হয়। `allowDangerousEmailAccountLinking` বন্ধ রাখা হয়েছে।

## Session ও authorization

সফল OAuth-এর পরে NextAuth ৩০ দিনের signed JWT HttpOnly cookie তৈরি করে। Protected request-এ session identity-এর পাশাপাশি active MongoDB user এবং `sessionVersion` পুনরায় যাচাই করা হয়। Disabled বা deletion-pending user পুরোনো cookie দিয়েও access পায় না। NextAuth-এর built-in state/CSRF controls OAuth ও sign-out flow রক্ষা করে।

## Collections ও indexes

- `users`: unique `emailNormalized`, account status ও initialized profile
- `oauthAccounts`: unique `(provider, providerAccountId)` এবং indexed `userId`

পুরোনো credentials implementation-এর `passwordResetTokens` ও `rateLimits` collection application আর ব্যবহার করে না। এই পরিবর্তন কোনো production collection স্বয়ংক্রিয়ভাবে delete করে না।

## Account deletion architecture

Repository active account-কে `pending_deletion` mark করতে পারে। এই status authorization সঙ্গে সঙ্গে বন্ধ করে। ভবিষ্যৎ deletion milestone-এ authenticated confirmation, recent reauthentication, grace period, related data cleanup ও irreversible purge job যুক্ত হবে। User-facing deletion control এখনো নেই।
