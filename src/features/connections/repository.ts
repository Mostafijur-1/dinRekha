import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";

import {
  connectionInvitationsCollection,
  connectionsCollection,
  usersCollection,
} from "@/lib/db/collections";
import { ensureDatabaseIndexes } from "@/lib/db/indexes";

const INVITE_LIFETIME_MS = 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function pair(a: ObjectId, b: ObjectId) {
  return a.toHexString() < b.toHexString()
    ? { userLowId: a, userHighId: b }
    : { userLowId: b, userHighId: a };
}

export type InvitePreview = { inviterName: string; expiresAt: Date };
export type ConnectionView = {
  id: string;
  userId: string;
  name: string;
  image?: string | null;
};

export async function createConnectionInvite(ownerId: string) {
  if (!ObjectId.isValid(ownerId)) return { status: "invalid" as const };
  await ensureDatabaseIndexes();
  const inviterId = new ObjectId(ownerId);
  const invitations = await connectionInvitationsCollection();
  const now = new Date();
  const since = new Date(now.getTime() - INVITE_LIFETIME_MS);
  const [recentCount, activeCount] = await Promise.all([
    invitations.countDocuments({ inviterId, createdAt: { $gte: since } }),
    invitations.countDocuments({
      inviterId,
      status: "active",
      expiresAt: { $gt: now },
    }),
  ]);
  if (recentCount >= 10 || activeCount >= 5)
    return { status: "rate_limited" as const };
  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(now.getTime() + INVITE_LIFETIME_MS);
  await invitations.insertOne({
    _id: new ObjectId(),
    inviterId,
    tokenHash: hashToken(token),
    status: "active",
    expiresAt,
    createdAt: now,
  });
  return { status: "success" as const, token, expiresAt };
}

export async function previewConnectionInvite(
  token: string,
  viewerId: string,
): Promise<InvitePreview | null> {
  if (!ObjectId.isValid(viewerId) || token.length < 20 || token.length > 100)
    return null;
  await ensureDatabaseIndexes();
  const viewer = new ObjectId(viewerId);
  const invitation = await (
    await connectionInvitationsCollection()
  ).findOne({
    tokenHash: hashToken(token),
    status: "active",
    expiresAt: { $gt: new Date() },
    inviterId: { $ne: viewer },
  });
  if (!invitation) return null;
  const inviter = await (
    await usersCollection()
  ).findOne(
    { _id: invitation.inviterId, status: "active" },
    { projection: { name: 1 } },
  );
  return inviter
    ? { inviterName: inviter.name, expiresAt: invitation.expiresAt }
    : null;
}

export async function redeemConnectionInvite(
  token: string,
  recipientId: string,
) {
  if (!ObjectId.isValid(recipientId) || token.length < 20 || token.length > 100)
    return false;
  await ensureDatabaseIndexes();
  const recipient = new ObjectId(recipientId);
  const now = new Date();
  const invitation = await (
    await connectionInvitationsCollection()
  ).findOneAndUpdate(
    {
      tokenHash: hashToken(token),
      status: "active",
      expiresAt: { $gt: now },
      inviterId: { $ne: recipient },
    },
    { $set: { status: "used", usedById: recipient, usedAt: now } },
    { returnDocument: "after" },
  );
  if (!invitation) return false;
  const connectionPair = pair(invitation.inviterId, recipient);
  await (
    await connectionsCollection()
  ).updateOne(
    connectionPair,
    {
      $set: { status: "active", updatedAt: now },
      $unset: { disconnectedAt: "" },
      $setOnInsert: {
        _id: new ObjectId(),
        createdById: recipient,
        createdAt: now,
      },
    },
    { upsert: true },
  );
  return true;
}

export async function listConnections(
  ownerId: string,
): Promise<ConnectionView[]> {
  if (!ObjectId.isValid(ownerId)) return [];
  const owner = new ObjectId(ownerId);
  const rows = await (
    await connectionsCollection()
  )
    .aggregate<ConnectionView>([
      {
        $match: {
          status: "active",
          $or: [{ userLowId: owner }, { userHighId: owner }],
        },
      },
      {
        $set: {
          otherId: {
            $cond: [
              { $eq: ["$userLowId", owner] },
              "$userHighId",
              "$userLowId",
            ],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "otherId",
          foreignField: "_id",
          as: "other",
        },
      },
      { $set: { other: { $first: "$other" } } },
      { $match: { "other.status": "active" } },
      {
        $project: {
          _id: 0,
          id: { $toString: "$_id" },
          userId: { $toString: "$otherId" },
          name: "$other.name",
          image: "$other.image",
        },
      },
      { $sort: { name: 1 } },
    ])
    .toArray();
  return rows;
}

export async function disconnectConnection(
  ownerId: string,
  connectionId: string,
) {
  if (!ObjectId.isValid(ownerId) || !ObjectId.isValid(connectionId))
    return false;
  const owner = new ObjectId(ownerId);
  const result = await (
    await connectionsCollection()
  ).updateOne(
    {
      _id: new ObjectId(connectionId),
      status: "active",
      $or: [{ userLowId: owner }, { userHighId: owner }],
    },
    {
      $set: {
        status: "disconnected",
        disconnectedAt: new Date(),
        updatedAt: new Date(),
      },
    },
  );
  return result.matchedCount === 1;
}
