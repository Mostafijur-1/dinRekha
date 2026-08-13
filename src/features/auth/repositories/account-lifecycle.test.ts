import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateOne, deleteMany } = vi.hoisted(() => ({
  updateOne: vi.fn(),
  deleteMany: vi.fn(),
}));
vi.mock("@/lib/db/collections", () => ({
  usersCollection: vi.fn(async () => ({ updateOne })),
  pushSubscriptionsCollection: vi.fn(async () => ({ deleteMany })),
}));
vi.mock("@/lib/db/indexes", () => ({ ensureDatabaseIndexes: vi.fn() }));

import { markAccountForDeletion } from "@/features/auth/repositories/user-repository";

describe("account push lifecycle", () => {
  beforeEach(() => vi.clearAllMocks());

  it("removes every push endpoint only after the owner is disabled", async () => {
    const owner = new ObjectId();
    updateOne.mockResolvedValue({ modifiedCount: 1 });
    await expect(markAccountForDeletion(owner.toHexString())).resolves.toBe(
      true,
    );
    expect(deleteMany).toHaveBeenCalledWith({ ownerId: owner });
  });

  it("preserves subscriptions when the account transition did not happen", async () => {
    updateOne.mockResolvedValue({ modifiedCount: 0 });
    await expect(
      markAccountForDeletion(new ObjectId().toHexString()),
    ).resolves.toBe(false);
    expect(deleteMany).not.toHaveBeenCalled();
  });
});
