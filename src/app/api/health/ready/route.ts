import { getDatabase } from "@/lib/db/client";
import { requestId, writeLog } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const id = requestId(request.headers.get("x-request-id"));
  const started = Date.now();
  try {
    await (await getDatabase()).command({ ping: 1 });
    writeLog("info", {
      event: "readiness_check",
      requestId: id,
      route: "/api/health/ready",
      status: 200,
      durationMs: Date.now() - started,
    });
    return Response.json(
      { status: "ready", requestId: id },
      { headers: { "cache-control": "no-store", "x-request-id": id } },
    );
  } catch {
    writeLog("error", {
      event: "readiness_check",
      requestId: id,
      route: "/api/health/ready",
      status: 503,
      durationMs: Date.now() - started,
    });
    return Response.json(
      { status: "unavailable", requestId: id },
      {
        status: 503,
        headers: { "cache-control": "no-store", "x-request-id": id },
      },
    );
  }
}
