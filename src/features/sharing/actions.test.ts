import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser, setSharingPolicy, revalidatePath } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  setSharingPolicy: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getCurrentUser }));
vi.mock("@/features/sharing/repository", () => ({ setSharingPolicy }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { updateSharingAction } from "@/features/sharing/actions";

describe("updateSharingAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stores only today's activity and timeline permissions", async () => {
    getCurrentUser.mockResolvedValue({ id: "owner-id" });
    setSharingPolicy.mockResolvedValue(true);
    const formData = new FormData();
    formData.set("dailyActivities", "on");
    formData.set("timeline", "on");
    formData.set("productivitySummary", "on");
    formData.set("streaks", "on");

    await updateSharingAction("recipient-id", formData);

    expect(setSharingPolicy).toHaveBeenCalledWith("owner-id", "recipient-id", {
      dailyActivities: true,
      timeline: true,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/connections");
  });

  it("does not update permissions without a session", async () => {
    getCurrentUser.mockResolvedValue(null);

    await updateSharingAction("recipient-id", new FormData());

    expect(setSharingPolicy).not.toHaveBeenCalled();
  });
});
