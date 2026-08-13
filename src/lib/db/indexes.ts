import "server-only";

import {
  oauthAccountsCollection,
  passwordResetTokensCollection,
  rateLimitsCollection,
  usersCollection,
} from "@/lib/db/collections";

type IndexGlobal = typeof globalThis & {
  __chondoIndexPromise?: Promise<void>;
};

const indexGlobal = globalThis as IndexGlobal;

async function createIndexes(): Promise<void> {
  const [users, accounts, resetTokens, rateLimits] = await Promise.all([
    usersCollection(),
    oauthAccountsCollection(),
    passwordResetTokensCollection(),
    rateLimitsCollection(),
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
    resetTokens.createIndex(
      { tokenHash: 1 },
      { unique: true, name: "password_reset_token_unique" },
    ),
    resetTokens.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0, name: "password_reset_expiry" },
    ),
    resetTokens.createIndex(
      { userId: 1, usedAt: 1 },
      { name: "password_reset_user" },
    ),
    rateLimits.createIndex(
      { key: 1 },
      { unique: true, name: "rate_limit_key_unique" },
    ),
    rateLimits.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0, name: "rate_limit_expiry" },
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
