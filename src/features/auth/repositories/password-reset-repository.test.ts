import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const findOneAndUpdate = vi.fn();
const deleteMany = vi.fn();
const insertOne = vi.fn();

vi.mock("@/lib/db/indexes", () => ({ ensureDatabaseIndexes: vi.fn() }));
vi.mock("@/lib/db/collections", () => ({
  passwordResetTokensCollection: vi.fn(async () => ({
    findOneAndUpdate,
    deleteMany,
    insertOne,
    deleteOne: vi.fn(),
  })),
}));

import {
  consumePasswordResetToken,
  replacePasswordResetToken,
} from "@/features/auth/repositories/password-reset-repository";

describe("password reset repository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("atomically returns a token once and rejects replay", async () => {
    const userId = new ObjectId();
    findOneAndUpdate
      .mockResolvedValueOnce({ userId })
      .mockResolvedValueOnce(null);

    await expect(consumePasswordResetToken("hashed-token")).resolves.toBe(
      userId.toHexString(),
    );
    await expect(consumePasswordResetToken("hashed-token")).resolves.toBeNull();
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        tokenHash: "hashed-token",
        usedAt: { $exists: false },
      }),
      expect.objectContaining({ $set: { usedAt: expect.any(Date) } }),
      { returnDocument: "after" },
    );
  });

  it("invalidates previous unused tokens before storing a replacement", async () => {
    const userId = new ObjectId().toHexString();
    await replacePasswordResetToken({
      userId,
      tokenHash: "only-the-hash-is-stored",
      expiresAt: new Date(Date.now() + 60_000),
    });

    expect(deleteMany).toHaveBeenCalledWith({
      userId: new ObjectId(userId),
      usedAt: { $exists: false },
    });
    expect(insertOne).toHaveBeenCalledWith(
      expect.objectContaining({ tokenHash: "only-the-hash-is-stored" }),
    );
  });
});
