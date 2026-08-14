import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser, redeemConnectionInvite, revalidatePath, redirect } =
  vi.hoisted(() => ({
    getCurrentUser: vi.fn(),
    redeemConnectionInvite: vi.fn(),
    revalidatePath: vi.fn(),
    redirect: vi.fn(),
  }));

vi.mock("@/lib/auth", () => ({ getCurrentUser }));
vi.mock("@/features/connections/repository", () => ({
  createConnectionInvite: vi.fn(),
  disconnectConnection: vi.fn(),
  redeemConnectionInvite,
}));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect }));

import { redeemInviteAction } from "@/features/connections/actions";

describe("redeemInviteAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns to the connection list with success feedback after redeeming", async () => {
    getCurrentUser.mockResolvedValue({ id: "user-id" });
    redeemConnectionInvite.mockResolvedValue("success");

    await redeemInviteAction("a".repeat(24));

    expect(revalidatePath).toHaveBeenCalledWith("/connections");
    expect(redirect).toHaveBeenCalledWith("/connections?connected=1");
  });

  it("shows a useful result when the invite cannot be redeemed", async () => {
    getCurrentUser.mockResolvedValue({ id: "user-id" });
    redeemConnectionInvite.mockResolvedValue("invalid");

    await redeemInviteAction("a".repeat(24));

    expect(redirect).toHaveBeenCalledWith("/connections?connected=error");
  });

  it("reports an already active connection without duplicating it", async () => {
    getCurrentUser.mockResolvedValue({ id: "user-id" });
    redeemConnectionInvite.mockResolvedValue("already_connected");

    await redeemInviteAction("a".repeat(24));

    expect(redirect).toHaveBeenCalledWith("/connections?connected=already");
  });
});
