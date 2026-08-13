import { beforeEach, describe, expect, it, vi } from "vitest";

const { countDocuments } = vi.hoisted(() => ({ countDocuments: vi.fn() }));

vi.mock("@/lib/db/collections", () => ({
  usersCollection: vi.fn(async () => ({ countDocuments })),
  oauthAccountsCollection: vi.fn(),
  pushSubscriptionsCollection: vi.fn(),
}));
vi.mock("@/lib/db/indexes", () => ({ ensureDatabaseIndexes: vi.fn() }));

import {
  canAutomaticallyLinkGoogleAccount,
  countActiveUsers,
} from "@/features/auth/repositories/user-repository";

describe("safe Google account linking", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects an account without verified email ownership", () => {
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

  it("counts only active member accounts", async () => {
    countDocuments.mockResolvedValue(17);

    await expect(countActiveUsers()).resolves.toBe(17);
    expect(countDocuments).toHaveBeenCalledWith({ status: "active" });
  });
});
