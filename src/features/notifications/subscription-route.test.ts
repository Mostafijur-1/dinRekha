import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser } = vi.hoisted(() => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getCurrentUser }));
vi.mock("@/lib/db/indexes", () => ({ ensureDatabaseIndexes: vi.fn() }));
vi.mock("@/lib/db/collections", () => ({
  pushSubscriptionsCollection: vi.fn(),
}));

import { DELETE, POST } from "@/app/api/notifications/subscription/route";

describe("push subscription route authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects unauthenticated subscribe and unsubscribe requests", async () => {
    getCurrentUser.mockResolvedValue(null);
    const subscribe = new Request(
      "https://dinrekha.test/api/notifications/subscription",
      { method: "POST", body: "{}" },
    );
    const unsubscribe = new Request(
      "https://dinrekha.test/api/notifications/subscription",
      { method: "DELETE", body: "{}" },
    );
    await expect(POST(subscribe)).resolves.toMatchObject({ status: 401 });
    await expect(DELETE(unsubscribe)).resolves.toMatchObject({ status: 401 });
  });
});
