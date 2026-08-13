import "server-only";

import { MongoServerError, ObjectId } from "mongodb";

import {
  type UserDocument,
  oauthAccountsCollection,
  usersCollection,
} from "@/lib/db/collections";
import { ensureDatabaseIndexes } from "@/lib/db/indexes";
import { normalizeEmail } from "@/lib/security/email";

export type SafeUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  passwordHash?: string;
  emailVerifiedAt?: Date;
  status: "active" | "disabled" | "pending_deletion";
  sessionVersion: number;
};

function toSafeUser(user: UserDocument | null): SafeUser | null {
  if (!user) return null;
  return {
    id: user._id.toHexString(),
    email: user.email,
    name: user.name,
    image: user.image,
    passwordHash: user.passwordHash,
    emailVerifiedAt: user.emailVerifiedAt,
    status: user.status,
    sessionVersion: user.sessionVersion ?? 1,
  };
}

export function canAutomaticallyLinkGoogleAccount(
  user: Pick<SafeUser, "emailVerifiedAt" | "status">,
): boolean {
  return user.status === "active" && Boolean(user.emailVerifiedAt);
}

export async function findUserByEmail(email: string): Promise<SafeUser | null> {
  await ensureDatabaseIndexes();
  const users = await usersCollection();
  return toSafeUser(
    await users.findOne({ emailNormalized: normalizeEmail(email) }),
  );
}

export async function findActiveUserById(id: string): Promise<SafeUser | null> {
  if (!ObjectId.isValid(id)) return null;
  await ensureDatabaseIndexes();
  const users = await usersCollection();
  return toSafeUser(
    await users.findOne({ _id: new ObjectId(id), status: "active" }),
  );
}

export async function createPasswordUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<SafeUser | null> {
  await ensureDatabaseIndexes();
  const users = await usersCollection();
  const now = new Date();
  const emailNormalized = normalizeEmail(input.email);

  try {
    const result = await users.insertOne({
      _id: new ObjectId(),
      email: emailNormalized,
      emailNormalized,
      name: input.name.trim(),
      passwordHash: input.passwordHash,
      status: "active",
      sessionVersion: 1,
      profile: { timezone: "Asia/Dhaka", initializedAt: now },
      createdAt: now,
      updatedAt: now,
    });
    return findActiveUserById(result.insertedId.toHexString());
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) return null;
    throw error;
  }
}

export async function findOrCreateGoogleUser(input: {
  providerAccountId: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
}): Promise<SafeUser | null> {
  if (!input.emailVerified) return null;
  await ensureDatabaseIndexes();
  const [users, accounts] = await Promise.all([
    usersCollection(),
    oauthAccountsCollection(),
  ]);
  const existingAccount = await accounts.findOne({
    provider: "google",
    providerAccountId: input.providerAccountId,
  });

  if (existingAccount)
    return findActiveUserById(existingAccount.userId.toHexString());

  const emailNormalized = normalizeEmail(input.email);
  let user = await users.findOne({ emailNormalized });

  if (!user) {
    const now = new Date();
    try {
      const result = await users.insertOne({
        _id: new ObjectId(),
        email: emailNormalized,
        emailNormalized,
        name: input.name.trim() || "ছন্দ ব্যবহারকারী",
        image: input.image,
        emailVerifiedAt: now,
        status: "active",
        sessionVersion: 1,
        profile: { timezone: "Asia/Dhaka", initializedAt: now },
        createdAt: now,
        updatedAt: now,
      });
      user = await users.findOne({ _id: result.insertedId });
    } catch (error) {
      if (!(error instanceof MongoServerError) || error.code !== 11000)
        throw error;
      user = await users.findOne({ emailNormalized });
    }
  }

  if (!user || !canAutomaticallyLinkGoogleAccount(user)) return null;

  try {
    const now = new Date();
    await accounts.insertOne({
      _id: new ObjectId(),
      userId: user._id,
      provider: "google",
      providerAccountId: input.providerAccountId,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    if (!(error instanceof MongoServerError) || error.code !== 11000)
      throw error;
    const linkedAccount = await accounts.findOne({
      provider: "google",
      providerAccountId: input.providerAccountId,
    });
    if (!linkedAccount || !linkedAccount.userId.equals(user._id)) return null;
  }

  return toSafeUser(user);
}

export async function updatePassword(
  userId: string,
  passwordHash: string,
): Promise<boolean> {
  if (!ObjectId.isValid(userId)) return false;
  const users = await usersCollection();
  const result = await users.updateOne(
    { _id: new ObjectId(userId), status: "active" },
    {
      $set: {
        passwordHash,
        emailVerifiedAt: new Date(),
        updatedAt: new Date(),
      },
      $inc: { sessionVersion: 1 },
    },
  );
  return result.modifiedCount === 1;
}

export async function markAccountForDeletion(userId: string): Promise<boolean> {
  if (!ObjectId.isValid(userId)) return false;
  const users = await usersCollection();
  const now = new Date();
  const result = await users.updateOne(
    { _id: new ObjectId(userId), status: "active" },
    { $set: { status: "pending_deletion", deletedAt: now, updatedAt: now } },
  );
  return result.modifiedCount === 1;
}
