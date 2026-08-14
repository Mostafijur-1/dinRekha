# Timeline foundation

## Edit boundary

বিদ্যমান Timeline entry-তে `Edit` থেকে শুধু Activity-এর নাম পরিবর্তন করা যায়।
Start time, end time, category এবং note edit form-এ পাঠানো হয় না; server action-ও এসব field
গ্রহণ করে না। সময় বা অন্য metadata বদলাতে হলে entry মুছে সঠিক slot-এ নতুন entry তৈরি করতে হবে।

## Scope

নির্বাচিত দিনের Timeline-এ ০০:০০–০৫:০০ পর্যন্ত একটি default `ঘুম` slot এবং
০৫:০০–২৩:০০ পর্যন্ত ঘণ্টাভিত্তিক স্থায়ী slot দেখায়:

- ব্যবহারকারী সংশ্লিষ্ট ঘণ্টা খুলে শুধু কাজের নাম লেখেন; start/end সময় slot থেকে তৈরি হয়
- বর্তমান ঘণ্টার entry end time ছাড়া in-progress হিসেবে থাকে
- প্রতিটি slot ওই সময়ের কাছাকাছি historical কাজকে suggestion হিসেবে আগে দেখায়
- occupied ও future slot overlap বা future-time mutation তৈরি করতে দেয় না
- প্রথম slot-এ সবসময় `ঘুম` presentation default হিসেবে tracked হয়; page load database write করে না
- `০০:০০–০৫:০০` একটি সংরক্ষিত, একক activity block; এখানে পুরোনো entry, আলাদা input বা suggestion দেখানো হয় না এবং নতুন entry তৈরি করা যায় না

- Activity, category, start time, end time ও private note
- completed এবং বর্তমানে চলমান entry
- edit ও delete
- আগের দিনের entry
- overlap rejection
- tracked ও untracked সময়
- authenticated owner isolation

Favorites, reports, offline sync এবং special metadata এই milestone-এর অংশ নয়।

## Data model

`timelineEntries` collection-এ প্রতিটি entry-র `ownerId`, `dateKey`,
`startMinute` এবং optional `endMinute` থাকে। Clock time-কে day-local minute হিসেবে রাখায়
দিনভিত্তিক sorting ও overlap query সরল থাকে এবং server timezone-এর ওপর নির্ভর করতে হয় না।

`endMinute` না থাকলে entry-টি `in_progress`; overlap calculation-এ এটি ঐ দিনের শেষ পর্যন্ত
সময় দখল করে। `timeline_owner_date_start` index owner, date ও start time অনুযায়ী list query
সমর্থন করে।

## Validation and authorization

Client form browser validation দেয়, কিন্তু server action Zod দিয়ে input পুনরায় যাচাই করে।
Server authenticated session থেকে owner নির্ধারণ করে; client থেকে user ID নেওয়া হয় না।
Repository-এর read, update ও delete query-তেও `ownerId` থাকে।

ভবিষ্যৎ দিন বা সময় গ্রহণ করা হয় না। Historical entry-তে end time আবশ্যক। নতুন বা edited
interval বিদ্যমান interval-এর সঙ্গে overlap করলে mutation প্রত্যাখ্যাত হয়; পাশাপাশি থাকা
interval বৈধ।

## Known limitation

Overlap check এবং insert/update বর্তমানে আলাদা database operation। একই owner একই সময়ে
একাধিক device থেকে সমান্তরাল mutation পাঠালে বিরল race condition-এ overlapping entry তৈরি
হতে পারে। ভবিষ্যৎ synchronization milestone-এ idempotency/serialization strategy যোগ করতে
হবে।
