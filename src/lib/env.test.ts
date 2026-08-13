import { describe, expect, it } from "vitest";

import { publicEnv, resolvePublicAppUrl } from "@/lib/env";

describe("public environment", () => {
  it("always exposes an absolute application URL", () => {
    expect(publicEnv.appUrl).toBeInstanceOf(URL);
    expect(publicEnv.appUrl.origin).toMatch(/^https?:\/\//);
  });

  it("normalizes a Vercel hostname without a protocol", () => {
    expect(
      resolvePublicAppUrl({ NEXT_PUBLIC_APP_URL: "dinrekha.vercel.app" }).href,
    ).toBe("https://dinrekha.vercel.app/");
  });

  it("uses the current Vercel deployment URL when no canonical URL is set", () => {
    expect(resolvePublicAppUrl({ VERCEL_URL: "preview.vercel.app" }).href).toBe(
      "https://preview.vercel.app/",
    );
  });

  it("rejects non-HTTP URLs", () => {
    expect(() =>
      resolvePublicAppUrl({ NEXT_PUBLIC_APP_URL: "javascript:alert(1)" }),
    ).toThrow("valid HTTP(S) URL or hostname");
  });
});
