import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSession, findActiveUserById } = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  findActiveUserById: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("@/features/auth/auth-options", () => ({ authOptions: {} }));
vi.mock("@/features/auth/repositories/user-repository", () => ({
  findActiveUserById,
}));

import { getCurrentUser } from "@/lib/auth";

describe("server authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not query private user data without a session identity", async () => {
    getServerSession.mockResolvedValue(null);
    await expect(getCurrentUser()).resolves.toBeNull();
    expect(findActiveUserById).not.toHaveBeenCalled();
  });

  it("revalidates the session user against the active database account", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "user-id", sessionVersion: 2 },
    });
    findActiveUserById.mockResolvedValue(null);

    await expect(getCurrentUser()).resolves.toBeNull();
    expect(findActiveUserById).toHaveBeenCalledWith("user-id");
  });

  it("rejects a valid cookie after the database session version changes", async () => {
    getServerSession.mockResolvedValue({
      user: { id: "user-id", sessionVersion: 1 },
    });
    findActiveUserById.mockResolvedValue({ id: "user-id", sessionVersion: 2 });

    await expect(getCurrentUser()).resolves.toBeNull();
  });
});
