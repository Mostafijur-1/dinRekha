import { isCronAuthorized } from "@/features/notifications/cron-auth";
import { dispatchDueNotifications } from "@/features/notifications/dispatcher";
import { requestId, writeLog } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const id = requestId(request.headers.get("x-request-id"));
  if (
    !isCronAuthorized(
      request.headers.get("authorization"),
      process.env.CRON_SECRET,
    )
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await dispatchDueNotifications();
    writeLog("info", {
      event: "notification_dispatch",
      requestId: id,
      route: "/api/cron/notifications",
      status: 200,
      count: result.sent,
    });
    return Response.json(result, {
      headers: { "x-request-id": id, "cache-control": "no-store" },
    });
  } catch {
    writeLog("error", {
      event: "notification_dispatch",
      requestId: id,
      route: "/api/cron/notifications",
      status: 500,
    });
    return Response.json(
      { error: "Dispatch unavailable", requestId: id },
      {
        status: 500,
        headers: { "x-request-id": id, "cache-control": "no-store" },
      },
    );
  }
}
