import { describe, expect, it } from "vitest";

import { publicEnv } from "@/lib/env";

describe("public environment", () => {
  it("always exposes an absolute application URL", () => {
    expect(publicEnv.appUrl).toBeInstanceOf(URL);
    expect(publicEnv.appUrl.origin).toMatch(/^https?:\/\//);
  });
});
