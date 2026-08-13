# Authentication architecture

## Email ও Password registration

Browser JSON request পাঠায় `/api/auth/register`-এ। Route origin, body size, Zod schema ও privacy-safe
rate limit যাচাই করে। Password Node.js Scrypt দিয়ে random salt সহ hash হয়; plaintext Password কোনো
collection বা log-এ যায় না। Unique normalized email index duplicate account আটকায় এবং নতুন user-এর
timezone/profile একসঙ্গে initialize হয়।
Duplicate ও নতুন registration একই response এবং navigation পায়, তাই UI থেকেও account existence
বোঝা যায় না। Registration-এর পর আলাদাভাবে Sign in করতে হয়।

## Sign in ও session

NextAuth Credentials provider generic failure দেয় এবং rate limit-এর পর stored Scrypt hash timing-safe
comparison করে। সফল হলে ৩০ দিনের encrypted JWT HttpOnly cookie তৈরি হয়। Dashboard প্রতিটি request-এ
session ID দিয়ে active user আবার যাচাই করে; disabled বা deletion-pending user-এর পুরোনো cookie access
দেয় না। Cookie-এর session version-ও database version-এর সঙ্গে মেলে; Password reset version বাড়িয়ে
আগের সব session বাতিল করে। NextAuth built-in CSRF protection sign-in ও sign-out endpoint রক্ষা করে।

## Google OAuth ও safe linking

Google provider কেবল `email_verified=true` profile গ্রহণ করে। Unique provider account index একটি
Google identity-কে একাধিক user-এর সঙ্গে যুক্ত হতে দেয় না। একই email-এর password account আগে email
ownership প্রমাণ না করলে automatic linking প্রত্যাখ্যাত হয়। Password reset সফল হওয়া email ownership
verification হিসেবে ধরা হয়।

## Password reset

Forgot-password endpoint account থাকুক বা না থাকুক একই response দেয়। Raw 256-bit token শুধু email
link-এ যায়; database-এ SHA-256 hash থাকে। Token ৩০ মিনিটে TTL index দিয়ে expire হয় এবং conditional
atomic update-এ একবারই consume হয়। নতুন Password বসলে অন্য reset token মুছে যায়। Reset page token
browser history থেকে সরায়। Email delivery Resend HTTP adapter-এর পেছনে আলাদা এবং token/email log হয় না।

## Collections ও indexes

- `users`: unique `emailNormalized`, status ও initialized profile
- `oauthAccounts`: unique `(provider, providerAccountId)` এবং indexed `userId`
- `passwordResetTokens`: unique hash, user lookup ও TTL expiry
- `rateLimits`: HMAC key unique ও TTL expiry

## Account deletion architecture

Repository active account-কে `pending_deletion` mark করতে পারে। এই status সঙ্গে সঙ্গে authorization
বন্ধ করে। ভবিষ্যৎ deletion milestone-এ authenticated confirmation, recent reauthentication, grace
period, related data cleanup ও irreversible purge job যুক্ত হবে। User-facing deletion control এখন নেই।

## Rate limits

- Sign in: ১৫ মিনিটে address+email প্রতি ৮ বার এবং address প্রতি ৩০ বার
- Registration: ১ ঘণ্টায় address+email প্রতি ৫ বার এবং address প্রতি ২০ বার
- Forgot Password: ১ ঘণ্টায় address+email প্রতি ৪ বার
- Reset submission: ৩০ মিনিটে address প্রতি ৬ বার

Raw email বা IP-এর বদলে HMAC key রাখা হয়। Vercel forwarded address trusted; অন্য hosting platform-এ
proxy header trust configuration পুনরায় যাচাই করতে হবে।
