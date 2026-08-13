import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser, markAccountForDeletion } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  markAccountForDeletion: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ getCurrentUser }));
vi.mock("@/features/auth/repositories/user-repository", () => ({
  markAccountForDeletion,
}));
import {
  initialDeletionState,
  requestAccountDeletion,
} from "@/features/account/deletion-actions";

describe("account deletion request", () => {
  beforeEach(() => vi.clearAllMocks());
  it("requires exact current email confirmation", async () => {
    getCurrentUser.mockResolvedValue({
      id: "user",
      email: "owner@example.com",
    });
    const form = new FormData();
    form.set("email", "other@example.com");
    await expect(
      requestAccountDeletion(initialDeletionState, form),
    ).resolves.toMatchObject({ status: "error" });
    expect(markAccountForDeletion).not.toHaveBeenCalled();
  });
  it("marks only the current account after confirmation", async () => {
    getCurrentUser.mockResolvedValue({
      id: "user",
      email: "owner@example.com",
    });
    markAccountForDeletion.mockResolvedValue(true);
    const form = new FormData();
    form.set("email", " OWNER@example.com ");
    await expect(
      requestAccountDeletion(initialDeletionState, form),
    ).resolves.toMatchObject({ status: "success" });
    expect(markAccountForDeletion).toHaveBeenCalledWith("user");
  });
});
