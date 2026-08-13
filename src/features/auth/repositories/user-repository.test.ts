import { describe, expect, it } from "vitest";

import { canAutomaticallyLinkGoogleAccount } from "@/features/auth/repositories/user-repository";

describe("safe Google account linking", () => {
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
});
