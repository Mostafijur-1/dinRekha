import { beforeEach, describe, expect, it, vi } from "vitest";

const { countDocuments, updateOne } = vi.hoisted(() => ({
  countDocuments: vi.fn(),
  updateOne: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
  usersCollection: vi.fn(async () => ({ countDocuments, updateOne })),
  oauthAccountsCollection: vi.fn(),
  pushSubscriptionsCollection: vi.fn(),
}));
vi.mock("@/lib/db/indexes", () => ({ ensureDatabaseIndexes: vi.fn() }));

import {
  canAutomaticallyLinkGoogleAccount,
  countActiveUsers,
  updateReminderSettings,
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

  it("saves reminder settings only for the active owner", async () => {
    const ownerId = "689df5b7c86e59b05192b886";
    const reminders = {
      activity: true,
      endOfDay: true,
      dailySummary: false,
      streak: false,
      endOfDayTime: "21:30",
      dailySummaryTime: "22:00",
    };
    updateOne.mockResolvedValue({ matchedCount: 1 });

    await expect(updateReminderSettings(ownerId, reminders)).resolves.toBe(
      true,
    );
    expect(updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ status: "active" }),
      expect.objectContaining({
        $set: expect.objectContaining({ "profile.reminders": reminders }),
      }),
    );
  });
});
