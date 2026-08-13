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

export type ActivityMeasurement =
  "boolean" | "counter" | "duration" | "quantity";
export type ActivityFrequency = "daily" | "selected_days";

export type DailyActivityDocument = {
  _id: ObjectId;
  ownerId: ObjectId;
  name: string;
  description?: string;
  category: string;
  measurement: ActivityMeasurement;
  target: number;
  unit?: string;
  frequency?: ActivityFrequency;
  days?: number[];
  effectiveFrom?: string;
  status: "active" | "archived";
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
};

export type DailyActivityProgressDocument = {
  _id: ObjectId;
  ownerId: ObjectId;
  activityId: ObjectId;
  dateKey: string;
  value: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type TimelineEntryDocument = {
  _id: ObjectId;
  ownerId: ObjectId;
  dateKey: string;
  activity: string;
  category: string;
  startMinute: number;
  endMinute?: number;
  note?: string;
  status: "completed" | "in_progress";
  createdAt: Date;
  updatedAt: Date;
};

export type ConnectionInvitationDocument = {
  _id: ObjectId;
  inviterId: ObjectId;
  tokenHash: string;
  status: "active" | "used" | "revoked";
  expiresAt: Date;
  usedById?: ObjectId;
  usedAt?: Date;
  createdAt: Date;
};

export type ConnectionDocument = {
  _id: ObjectId;
  userLowId: ObjectId;
  userHighId: ObjectId;
  status: "active" | "disconnected";
  createdById: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  disconnectedAt?: Date;
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

export async function dailyActivitiesCollection(): Promise<
  Collection<DailyActivityDocument>
> {
  return (await getDatabase()).collection<DailyActivityDocument>(
    "dailyActivities",
  );
}

export async function dailyActivityProgressCollection(): Promise<
  Collection<DailyActivityProgressDocument>
> {
  return (await getDatabase()).collection<DailyActivityProgressDocument>(
    "dailyActivityProgress",
  );
}

export async function timelineEntriesCollection(): Promise<
  Collection<TimelineEntryDocument>
> {
  return (await getDatabase()).collection<TimelineEntryDocument>(
    "timelineEntries",
  );
}

export async function connectionInvitationsCollection(): Promise<
  Collection<ConnectionInvitationDocument>
> {
  return (await getDatabase()).collection<ConnectionInvitationDocument>(
    "connectionInvitations",
  );
}

export async function connectionsCollection(): Promise<
  Collection<ConnectionDocument>
> {
  return (await getDatabase()).collection<ConnectionDocument>("connections");
}
