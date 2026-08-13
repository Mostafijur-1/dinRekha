import { describe, expect, it } from "vitest";

import { profileSettingsSchema } from "@/features/settings/schema";

describe("profile settings schema", () => {
  it("accepts a trimmed name and supported timezone", () => {
    expect(
      profileSettingsSchema.parse({
        name: "  মোস্তাফিজ  ",
        timezone: "Asia/Dhaka",
      }),
    ).toEqual({
      name: "মোস্তাফিজ",
      timezone: "Asia/Dhaka",
    });
  });

  it("rejects arbitrary timezone input", () => {
    expect(
      profileSettingsSchema.safeParse({
        name: "মোস্তাফিজ",
        timezone: "Unknown/Zone",
      }).success,
    ).toBe(false);
  });
});
