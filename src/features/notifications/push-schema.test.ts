import { describe, expect, it } from "vitest";
import { pushSubscriptionSchema } from "@/features/notifications/push-schema";

describe("push subscription validation", () => {
  it("accepts a bounded HTTPS subscription", () => {
    expect(
      pushSubscriptionSchema.safeParse({
        endpoint: "https://push.example.test/subscription",
        keys: { p256dh: "a".repeat(65), auth: "b".repeat(16) },
      }).success,
    ).toBe(true);
  });

  it("rejects missing browser keys and oversized endpoints", () => {
    expect(
      pushSubscriptionSchema.safeParse({
        endpoint: `https://example.test/${"a".repeat(2100)}`,
        keys: {},
      }).success,
    ).toBe(false);
  });
});
