import "server-only";

import type { Collection, ObjectId } from "mongodb";

import { getDatabase } from "@/lib/db/client";

export type UserDocument = {
  _id: ObjectId;
  email: string;
  emailNormalized: string;
  name: string;
  image?: string | null;
  emailVerifiedAt?: Date;
  status: "active" | "disabled" | "pending_deletion";
  sessionVersion: number;
  profile: {
    timezone: string;
    initializedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export type OAuthAccountDocument = {
  _id: ObjectId;
  userId: ObjectId;
  provider: string;
  providerAccountId: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function usersCollection(): Promise<Collection<UserDocument>> {
  return (await getDatabase()).collection<UserDocument>("users");
}

export async function oauthAccountsCollection(): Promise<
  Collection<OAuthAccountDocument>
> {
  return (await getDatabase()).collection<OAuthAccountDocument>(
    "oauthAccounts",
  );
}
