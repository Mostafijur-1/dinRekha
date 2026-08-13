import "server-only";

import { ObjectId } from "mongodb";

import { passwordResetTokensCollection } from "@/lib/db/collections";
import { ensureDatabaseIndexes } from "@/lib/db/indexes";

export async function replacePasswordResetToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<void> {
  await ensureDatabaseIndexes();
  const tokens = await passwordResetTokensCollection();
  const userId = new ObjectId(input.userId);

  await tokens.deleteMany({ userId, usedAt: { $exists: false } });
  await tokens.insertOne({
    _id: new ObjectId(),
    userId,
    tokenHash: input.tokenHash,
    expiresAt: input.expiresAt,
    createdAt: new Date(),
  });
}

export async function consumePasswordResetToken(
  tokenHash: string,
): Promise<string | null> {
  await ensureDatabaseIndexes();
  const tokens = await passwordResetTokensCollection();
  const now = new Date();
  const token = await tokens.findOneAndUpdate(
    { tokenHash, expiresAt: { $gt: now }, usedAt: { $exists: false } },
    { $set: { usedAt: now } },
    { returnDocument: "after" },
  );

  return token?.userId.toHexString() ?? null;
}

export async function invalidatePasswordResetTokens(
  userId: string,
): Promise<void> {
  if (!ObjectId.isValid(userId)) return;
  const tokens = await passwordResetTokensCollection();
  await tokens.deleteMany({ userId: new ObjectId(userId) });
}

export async function removePasswordResetToken(
  tokenHash: string,
): Promise<void> {
  const tokens = await passwordResetTokensCollection();
  await tokens.deleteOne({ tokenHash });
}
