import "server-only";

import { ObjectId } from "mongodb";
import {
  connectionsCollection,
  sharingPoliciesCollection,
} from "@/lib/db/collections";
import { ensureDatabaseIndexes } from "@/lib/db/indexes";

export type SharingPermissions = {
  productivitySummary: boolean;
  streaks: boolean;
  dailyActivities: boolean;
  timeline: boolean;
};
export const privatePermissions: SharingPermissions = {
  productivitySummary: false,
  streaks: false,
  dailyActivities: false,
  timeline: false,
};
export const defaultConnectedPermissions: SharingPermissions = {
  productivitySummary: true,
  streaks: true,
  dailyActivities: true,
  timeline: true,
};

async function activeConnection(owner: ObjectId, recipient: ObjectId) {
  const lowFirst = owner.toHexString() < recipient.toHexString();
  return (await connectionsCollection()).findOne({
    userLowId: lowFirst ? owner : recipient,
    userHighId: lowFirst ? recipient : owner,
    status: "active",
  });
}

export async function getSharingPolicy(
  ownerId: string,
  recipientId: string,
): Promise<SharingPermissions> {
  if (!ObjectId.isValid(ownerId) || !ObjectId.isValid(recipientId))
    return privatePermissions;
  const owner = new ObjectId(ownerId);
  const recipient = new ObjectId(recipientId);
  const connection = await activeConnection(owner, recipient);
  if (!connection) return privatePermissions;
  const policy = await (
    await sharingPoliciesCollection()
  ).findOne({
    connectionId: connection._id,
    ownerId: owner,
    recipientId: recipient,
  });
  return policy
    ? {
        productivitySummary: policy.productivitySummary,
        streaks: policy.streaks,
        dailyActivities: policy.dailyActivities ?? true,
        timeline: policy.timeline ?? true,
      }
    : defaultConnectedPermissions;
}

export async function setSharingPolicy(
  ownerId: string,
  recipientId: string,
  permissions: SharingPermissions,
) {
  if (
    !ObjectId.isValid(ownerId) ||
    !ObjectId.isValid(recipientId) ||
    ownerId === recipientId
  )
    return false;
  await ensureDatabaseIndexes();
  const owner = new ObjectId(ownerId);
  const recipient = new ObjectId(recipientId);
  const connection = await activeConnection(owner, recipient);
  if (!connection) return false;
  const now = new Date();
  await (
    await sharingPoliciesCollection()
  ).updateOne(
    { connectionId: connection._id, ownerId: owner, recipientId: recipient },
    {
      $set: {
        productivitySummary: permissions.productivitySummary,
        streaks: permissions.streaks,
        dailyActivities: permissions.dailyActivities,
        timeline: permissions.timeline,
        updatedAt: now,
      },
      $setOnInsert: { _id: new ObjectId(), createdAt: now },
    },
    { upsert: true },
  );
  return true;
}

export async function authorizeSharedReport(ownerId: string, viewerId: string) {
  const permissions = await getSharingPolicy(ownerId, viewerId);
  return permissions.productivitySummary ||
    permissions.streaks ||
    permissions.dailyActivities ||
    permissions.timeline
    ? permissions
    : null;
}
