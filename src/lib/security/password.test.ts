import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/security/password";

describe("password security", () => {
  it("creates salted hashes and verifies only the matching password", async () => {
    const firstHash = await hashPassword("একটি-খুব-নিরাপদ-password-123");
    const secondHash = await hashPassword("একটি-খুব-নিরাপদ-password-123");

    expect(firstHash).not.toBe(secondHash);
    await expect(
      verifyPassword("একটি-খুব-নিরাপদ-password-123", firstHash),
    ).resolves.toBe(true);
    await expect(verifyPassword("ভুল-password-123", firstHash)).resolves.toBe(
      false,
    );
  });

  it("rejects malformed stored values safely", async () => {
    await expect(
      verifyPassword("anything", "not-a-password-hash"),
    ).resolves.toBe(false);
  });
});
