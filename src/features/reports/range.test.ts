import { describe, expect, it } from "vitest";

import { resolveReportRange } from "@/features/reports/range";

describe("report range policy", () => {
  it("defaults invalid input to the last seven days", () => {
    const range = resolveReportRange(
      { range: "custom", start: "bad", end: "2026-08-13" },
      "2026-08-13",
    );
    expect(range).toMatchObject({
      mode: "week",
      start: "2026-08-07",
      end: "2026-08-13",
    });
    expect(range.dateKeys).toHaveLength(7);
  });

  it("uses the current calendar month", () => {
    const range = resolveReportRange({ range: "month" }, "2026-08-13");
    expect(range).toMatchObject({
      mode: "month",
      start: "2026-08-01",
      end: "2026-08-13",
    });
    expect(range.dateKeys).toHaveLength(13);
  });

  it("clamps custom ranges to today and ninety days", () => {
    const range = resolveReportRange(
      { range: "custom", start: "2026-01-01", end: "2026-08-20" },
      "2026-08-13",
    );
    expect(range.end).toBe("2026-08-13");
    expect(range.dateKeys).toHaveLength(90);
    expect(range.start).toBe("2026-05-16");
  });
});
