import "server-only";

import {
  dailyActivitiesCollection,
  dailyActivityProgressCollection,
  oauthAccountsCollection,
  timelineEntriesCollection,
  usersCollection,
  connectionInvitationsCollection,
  connectionsCollection,
  sharingPoliciesCollection,
} from "@/lib/db/collections";

type IndexGlobal = typeof globalThis & {
  __chondoIndexPromise?: Promise<void>;
};

const indexGlobal = globalThis as IndexGlobal;

async function createIndexes(): Promise<void> {
  const [
    users,
    accounts,
    activities,
    progress,
    timeline,
    invitations,
    connections,
    policies,
  ] = await Promise.all([
    usersCollection(),
    oauthAccountsCollection(),
    dailyActivitiesCollection(),
    dailyActivityProgressCollection(),
    timelineEntriesCollection(),
    connectionInvitationsCollection(),
    connectionsCollection(),
    sharingPoliciesCollection(),
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
    invitations.createIndex(
      { tokenHash: 1 },
      { unique: true, name: "invite_token_unique" },
    ),
    invitations.createIndex(
      { inviterId: 1, status: 1, expiresAt: 1, createdAt: -1 },
      { name: "invite_owner_status_expiry" },
    ),
    invitations.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 7 * 24 * 60 * 60, name: "invite_expiry_cleanup" },
    ),
    connections.createIndex(
      { userLowId: 1, userHighId: 1 },
      { unique: true, name: "connection_pair_unique" },
    ),
    connections.createIndex(
      { userHighId: 1, status: 1 },
      { name: "connection_high_status" },
    ),
    connections.createIndex(
      { userLowId: 1, status: 1 },
      { name: "connection_low_status" },
    ),
    policies.createIndex(
      { connectionId: 1, ownerId: 1, recipientId: 1 },
      { unique: true, name: "sharing_direction_unique" },
    ),
    policies.createIndex(
      { recipientId: 1, ownerId: 1 },
      { name: "sharing_recipient_owner" },
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
