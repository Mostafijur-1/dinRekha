# Daily Activities architecture

## Progress and score

Counter Activity-এর `+`/`-` button ও সরাসরি number input একই controlled value ব্যবহার করে।
Button চাপলে input সঙ্গে সঙ্গে বদলায় এবং সেই absolute value server action-এ সংরক্ষণ হয়।

Home, Dashboard ও Report একই proportional score ব্যবহার করে: প্রতিটি Activity-এর
`min(value / target, 1)` completion ratio-এর গড়কে শতকরা হিসেবে দেখানো হয়। ফলে আংশিক
অগ্রগতিও score-এ যোগ হয়, কিন্তু target-এর বেশি value ১০০%-এর বেশি contribution দেয় না।

## Archive restoration

Settings owner-এর archived Activity তালিকা দেখায়। Restore action authenticated owner ও
archived status দিয়ে mutation scope করে, একই definition-কে active করে, `archivedAt` সরায় এবং
তালিকার শেষে রাখে। পুরোনো progress row অপরিবর্তিত থাকে। বর্তমান model আলাদা active/archive
period history রাখে না; তাই restore-এর আগের archived gap historical report-এ আলাদা করে বাদ দেওয়া
যায় না।

## Scope

User Activity তৈরি, তালিকা দেখা, definition edit, নির্বাচিত দিনের value update, archive এবং তালিকার ক্রম পরিবর্তন করতে পারে। Activity প্রতিদিন বা নির্বাচিত সপ্তাহের দিনে schedule করা যায়। Reminders, offline synchronization, arbitrary calendar picker ও reports পরে যোগ হবে।

## Data model

`dailyActivities` collection reusable definition রাখে: owner, name, description, category, measurement, target, unit, frequency, weekdays, effective date, status ও ordering metadata। Measurement mode হলো `boolean`, `counter`, `duration` বা `quantity`। Creation-এর পরে measurement immutable; mode বদলালে পুরোনো progress-এর অর্থ বদলে যেতে পারে বলে এই সিদ্ধান্ত। পুরোনো document-এ frequency না থাকলে `daily` এবং effective date না থাকলে backward-compatible historical definition ধরা হয়।

`dailyActivityProgress` collection owner + activity + local date key অনুযায়ী value এবং completion timestamp রাখে। Unique compound index একই Activity-এর একই দিনের duplicate progress row আটকায়। Definitions ও progress আলাদা থাকায় Activity edit/archive করলেও future historical reporting সম্ভব।

## Request flow

Dashboard একটি dynamic Server Component। Session থেকে active user revalidate করে এবং `?date=YYYY-MM-DD` থেকে নির্বাচিত দিন নেয়। Calendar date invalid বা user timezone-এর আজকের চেয়ে ভবিষ্যৎ হলে আজকে fallback করা হয়। Owner-scoped aggregation schedule, effective date ও existing historical progress মিলিয়ে definitions দেখায়। কোনো private result shared cache-এ রাখা হয় না।

Create, edit, progress, archive ও reorder React Server Actions দিয়ে হয়। প্রতিটি action আবার session যাচাই করে, Zod দিয়ে untrusted FormData validate করে এবং repository call-এ session-derived owner ID পাঠায়। Client কেবল Activity ID, selected date ও পরিবর্তন পাঠায়; owner ID কখনো client claim থেকে নেওয়া হয় না। Future date ও unscheduled day-তে progress লেখা server-side প্রত্যাখ্যাত হয়। Mutation শেষে `/dashboard` revalidate হয়।

Past view-এ progress সংশোধন করা যায়, কিন্তু definition edit, archive, create ও reorder শুধু আজকের view-এ থাকে। Recurrence পরে পরিবর্তিত হলেও কোনো historical date-এ progress থাকলে সেই Activity সেখানে দৃশ্যমান থাকে।

## Measurement behavior

- Boolean: value `0` বা `1`; এক tap-এ Done/Not Done।
- Counter: বর্তমান value থেকে UI-তে `+1`/`-1` absolute update। একই মুহূর্তে একাধিক device থেকে tap করলে last-write-wins হতে পারে; offline/sync milestone-এ idempotent atomic increments যোগ করতে হবে।
- Duration: মিনিট default unit; user আজকের মোট value লিখে update করে।
- Quantity: explicit unit আবশ্যক; user আজকের মোট value লিখে update করে।

Reorder owner-scoped adjacent `sortOrder` swap ব্যবহার করে। একই account থেকে একেবারে একই সময়ে একাধিক reorder হলে duplicate order তৈরি হতে পারে; list-এর `createdAt` tie-breaker UI স্থিতিশীল রাখে। Collaborative/offline ordering এলে versioned ordering প্রয়োজন হবে।

## Privacy and deletion

প্রতিটি read ও mutation `ownerId` দিয়ে scoped। অন্য user guessed ObjectId দিলেও definition lookup/mutation match হয় না। “Delete” hard delete নয়; archive করা হয়, যাতে historical progress accidentalভাবে হারিয়ে না যায়। এই milestone কোনো পুরোনো collection বা user data delete করে না।
