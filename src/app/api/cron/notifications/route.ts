import { isCronAuthorized } from "@/features/notifications/cron-auth";
import { dispatchDueNotifications } from "@/features/notifications/dispatcher";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (
    !isCronAuthorized(
      request.headers.get("authorization"),
      process.env.CRON_SECRET,
    )
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json(await dispatchDueNotifications());
}
