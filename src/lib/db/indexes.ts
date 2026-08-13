import "server-only";

import { oauthAccountsCollection, usersCollection } from "@/lib/db/collections";

type IndexGlobal = typeof globalThis & {
  __chondoIndexPromise?: Promise<void>;
};

const indexGlobal = globalThis as IndexGlobal;

async function createIndexes(): Promise<void> {
  const [users, accounts] = await Promise.all([
    usersCollection(),
    oauthAccountsCollection(),
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
