# Daily Activities architecture

## Scope

এই milestone reusable Daily Activity এবং আজকের progress-এর প্রথম production slice। User Activity তৈরি, তালিকা দেখা, definition edit, আজকের value update এবং archive করতে পারে। Recurrence, reminders, offline synchronization, historical date navigation, ordering ও reports পরে যোগ হবে।

## Data model

`dailyActivities` collection reusable definition রাখে: owner, name, description, category, measurement, target, unit, status ও ordering metadata। Measurement mode হলো `boolean`, `counter`, `duration` বা `quantity`। Creation-এর পরে measurement immutable; mode বদলালে পুরোনো progress-এর অর্থ বদলে যেতে পারে বলে এই সিদ্ধান্ত।

`dailyActivityProgress` collection owner + activity + local date key অনুযায়ী value এবং completion timestamp রাখে। Unique compound index একই Activity-এর একই দিনের duplicate progress row আটকায়। Definitions ও progress আলাদা থাকায় Activity edit/archive করলেও future historical reporting সম্ভব।

## Request flow

Dashboard একটি dynamic Server Component। Session থেকে active user revalidate করে user timezone অনুযায়ী আজকের date key বানায় এবং owner-scoped aggregation-এ definitions ও progress পড়ে। কোনো private result shared cache-এ রাখা হয় না।

Create, edit, progress ও archive React Server Actions দিয়ে হয়। প্রতিটি action আবার session যাচাই করে, Zod দিয়ে untrusted FormData validate করে এবং repository call-এ session-derived owner ID পাঠায়। Client কেবল Activity ID ও পরিবর্তন পাঠায়; owner ID কখনো client claim থেকে নেওয়া হয় না। Mutation শেষে `/dashboard` revalidate হয়।

## Measurement behavior

- Boolean: value `0` বা `1`; এক tap-এ Done/Not Done।
- Counter: বর্তমান value থেকে UI-তে `+1`/`-1` absolute update। একই মুহূর্তে একাধিক device থেকে tap করলে last-write-wins হতে পারে; offline/sync milestone-এ idempotent atomic increments যোগ করতে হবে।
- Duration: মিনিট default unit; user আজকের মোট value লিখে update করে।
- Quantity: explicit unit আবশ্যক; user আজকের মোট value লিখে update করে।

## Privacy and deletion

প্রতিটি read ও mutation `ownerId` দিয়ে scoped। অন্য user guessed ObjectId দিলেও definition lookup/mutation match হয় না। “Delete” hard delete নয়; archive করা হয়, যাতে historical progress accidentalভাবে হারিয়ে না যায়। এই milestone কোনো পুরোনো collection বা user data delete করে না।
