import "server-only";

import { randomUUID } from "node:crypto";

export type LogEvent =
  "readiness_check" | "notification_dispatch" | "api_failure";

type SafeLog = {
  event: LogEvent;
  requestId: string;
  route?: string;
  status?: number;
  durationMs?: number;
  count?: number;
};

export function requestId(header?: string | null) {
  return header?.slice(0, 100) || randomUUID();
}

export function writeLog(level: "info" | "warn" | "error", data: SafeLog) {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    ...data,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}
