import "server-only";

import { createHmac } from "node:crypto";

import { getServerEnvironment } from "@/lib/env.server";

export function getRequestAddress(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

export function privacySafeKey(scope: string, ...values: string[]): string {
  const environment = getServerEnvironment();
  return createHmac(
    "sha256",
    environment.RATE_LIMIT_SECRET ?? environment.AUTH_SECRET,
  )
    .update([scope, ...values].join("\u0000"), "utf8")
    .digest("base64url");
}
