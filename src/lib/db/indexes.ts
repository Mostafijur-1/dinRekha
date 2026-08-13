import "server-only";

import {
  dailyActivitiesCollection,
  dailyActivityProgressCollection,
  oauthAccountsCollection,
  timelineEntriesCollection,
  usersCollection,
} from "@/lib/db/collections";

type IndexGlobal = typeof globalThis & {
  __chondoIndexPromise?: Promise<void>;
};

const indexGlobal = globalThis as IndexGlobal;

async function createIndexes(): Promise<void> {
  const [users, accounts, activities, progress, timeline] = await Promise.all([
    usersCollection(),
    oauthAccountsCollection(),
    dailyActivitiesCollection(),
    dailyActivityProgressCollection(),
    timelineEntriesCollection(),
  ]);

  await Promise.all([
    users.createIndex(
      { emailNormalized: 1 },
      { unique: true, name: "users_email_unique" },
    ),
    users.createIndex({ status: 1 }, { name: "users_status" }),
    accounts.createIndex(
      { provider: 1, providerAccountId: 1 },
      { unique: true, name: "oauth_provider_account_unique" },
    ),
    accounts.createIndex({ userId: 1 }, { name: "oauth_user" }),
    activities.createIndex(
      { ownerId: 1, status: 1, sortOrder: 1, createdAt: 1 },
      { name: "daily_activity_owner_list" },
    ),
    progress.createIndex(
      { ownerId: 1, activityId: 1, dateKey: 1 },
      { unique: true, name: "daily_progress_owner_activity_date_unique" },
    ),
    progress.createIndex(
      { ownerId: 1, dateKey: 1 },
      { name: "daily_progress_owner_date" },
    ),
    timeline.createIndex(
      { ownerId: 1, dateKey: 1, startMinute: 1 },
      { name: "timeline_owner_date_start" },
    ),
    timeline.createIndex(
      { ownerId: 1, status: 1, dateKey: 1 },
      { name: "timeline_owner_status_date" },
    ),
  ]);
}

export function ensureDatabaseIndexes(): Promise<void> {
  indexGlobal.__chondoIndexPromise ??= createIndexes().catch(
    (error: unknown) => {
      indexGlobal.__chondoIndexPromise = undefined;
      throw error;
    },
  );

  return indexGlobal.__chondoIndexPromise;
}
