import { beforeEach, describe, expect, it, vi } from "vitest";

const { command, writeLog } = vi.hoisted(() => ({
  command: vi.fn(),
  writeLog: vi.fn(),
}));
vi.mock("@/lib/db/client", () => ({
  getDatabase: vi.fn(async () => ({ command })),
}));
vi.mock("@/lib/observability/logger", () => ({
  requestId: vi.fn(() => "request-1"),
  writeLog,
}));

import { GET } from "@/app/api/health/ready/route";

describe("readiness route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns ready without caching after MongoDB responds", async () => {
    command.mockResolvedValue({ ok: 1 });
    const response = await GET(
      new Request("https://dinrekha.test/api/health/ready"),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-request-id")).toBe("request-1");
  });

  it("returns a generic 503 without leaking database errors", async () => {
    command.mockRejectedValue(new Error("mongodb://secret-host"));
    const response = await GET(
      new Request("https://dinrekha.test/api/health/ready"),
    );
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("secret-host");
    expect(writeLog).toHaveBeenCalledWith(
      "error",
      expect.not.objectContaining({ error: expect.anything() }),
    );
  });
});
