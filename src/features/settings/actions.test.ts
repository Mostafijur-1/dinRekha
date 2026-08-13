import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser, updateUserProfile, revalidatePath } = vi.hoisted(
  () => ({
    getCurrentUser: vi.fn(),
    updateUserProfile: vi.fn(),
    revalidatePath: vi.fn(),
  }),
);
vi.mock("@/lib/auth", () => ({ getCurrentUser }));
vi.mock("@/features/auth/repositories/user-repository", () => ({
  updateUserProfile,
}));
vi.mock("next/cache", () => ({ revalidatePath }));

import { updateProfileAction } from "@/features/settings/actions";
import { initialSettingsActionState } from "@/features/settings/action-state";

describe("profile settings action", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requires an authenticated user", async () => {
    getCurrentUser.mockResolvedValue(null);
    const form = new FormData();
    form.set("name", "মোস্তাফিজ");
    form.set("timezone", "Asia/Dhaka");
    await expect(
      updateProfileAction(initialSettingsActionState, form),
    ).resolves.toMatchObject({ status: "error" });
    expect(updateUserProfile).not.toHaveBeenCalled();
  });

  it("updates only validated profile fields for the current user", async () => {
    getCurrentUser.mockResolvedValue({ id: "user-id" });
    updateUserProfile.mockResolvedValue(true);
    const form = new FormData();
    form.set("name", "  মোস্তাফিজ  ");
    form.set("timezone", "UTC");
    form.set("email", "attacker@example.com");
    await expect(
      updateProfileAction(initialSettingsActionState, form),
    ).resolves.toEqual({
      status: "success",
      message: "Profile সংরক্ষণ হয়েছে।",
    });
    expect(updateUserProfile).toHaveBeenCalledWith("user-id", {
      name: "মোস্তাফিজ",
      timezone: "UTC",
    });
  });
});
