import { describe, expect, it } from "vitest";

import {
  registrationSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas";

describe("authentication validation", () => {
  it("rejects short and mismatched registration passwords", () => {
    const result = registrationSchema.safeParse({
      name: "রাফি",
      email: "rafi@example.com",
      password: "short",
      confirmPassword: "different",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid password reset boundary", () => {
    const password = "নিরাপদ-password-12345";
    const result = resetPasswordSchema.safeParse({
      token: "a".repeat(43),
      password,
      confirmPassword: password,
    });

    expect(result.success).toBe(true);
  });
});
