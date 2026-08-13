import { describe, expect, it } from "vitest";
import { isCronAuthorized } from "@/features/notifications/cron-auth";

describe("cron authorization", () => {
  it("requires an exact bearer secret", () => {
    expect(
      isCronAuthorized("Bearer strong-secret-value", "strong-secret-value"),
    ).toBe(true);
    expect(isCronAuthorized("Bearer wrong", "strong-secret-value")).toBe(false);
    expect(isCronAuthorized(null, "strong-secret-value")).toBe(false);
    expect(isCronAuthorized("Bearer strong-secret-value", undefined)).toBe(
      false,
    );
  });
});
