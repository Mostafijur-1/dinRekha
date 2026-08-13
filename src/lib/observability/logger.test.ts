import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { requestId, writeLog } from "@/lib/observability/logger";

describe("privacy-safe logger", () => {
  it("reuses a bounded request id", () => {
    expect(requestId("trace-1")).toBe("trace-1");
    expect(requestId("x".repeat(200))).toHaveLength(100);
  });

  it("emits structured allowlisted data", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    writeLog("info", {
      event: "readiness_check",
      requestId: "r1",
      status: 200,
    });
    expect(JSON.parse(String(spy.mock.calls[0]?.[0]))).toMatchObject({
      level: "info",
      event: "readiness_check",
      requestId: "r1",
      status: 200,
    });
    spy.mockRestore();
  });
});
