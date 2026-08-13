import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateOne } = vi.hoisted(() => ({ updateOne: vi.fn() }));

vi.mock("@/lib/db/collections", () => ({
  usersCollection: vi.fn(async () => ({ updateOne })),
  oauthAccountsCollection: vi.fn(),
}));
vi.mock("@/lib/db/indexes", () => ({ ensureDatabaseIndexes: vi.fn() }));

import {
  canAutomaticallyLinkGoogleAccount,
  updatePassword,
} from "@/features/auth/repositories/user-repository";

describe("safe OAuth account linking", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects an unverified password account with the same email", () => {
    expect(
      canAutomaticallyLinkGoogleAccount({
        status: "active",
        emailVerifiedAt: undefined,
      }),
    ).toBe(false);
  });

  it("allows only an active account with verified email ownership", () => {
    expect(
      canAutomaticallyLinkGoogleAccount({
        status: "active",
        emailVerifiedAt: new Date(),
      }),
    ).toBe(true);
    expect(
      canAutomaticallyLinkGoogleAccount({
        status: "disabled",
        emailVerifiedAt: new Date(),
      }),
    ).toBe(false);
  });

  it("invalidates existing sessions when a reset changes the password", async () => {
    const userId = new ObjectId().toHexString();
    updateOne.mockResolvedValue({ modifiedCount: 1 });

    await expect(updatePassword(userId, "new-hash")).resolves.toBe(true);
    expect(updateOne).toHaveBeenCalledWith(
      { _id: new ObjectId(userId), status: "active" },
      expect.objectContaining({ $inc: { sessionVersion: 1 } }),
    );
  });
});
