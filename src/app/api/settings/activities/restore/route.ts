import { revalidatePath } from "next/cache";

import { restoreDailyActivity } from "@/features/daily-activities/repository";
import { activityIdSchema } from "@/features/daily-activities/schemas";
import { getCurrentUser } from "@/lib/auth";
import { requestId, writeLog } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const responseHeaders = (id: string) => ({
  "cache-control": "no-store",
  "x-request-id": id,
});

export async function POST(request: Request) {
  const id = requestId(request.headers.get("x-request-id"));
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return Response.json(
      {
        message:
          "অনুরোধটি যাচাই করা যায়নি। পৃষ্ঠাটি refresh করে আবার চেষ্টা করুন।",
      },
      { status: 403, headers: responseHeaders(id) },
    );
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json(
        { message: "Session শেষ হয়েছে। আবার প্রবেশ করুন।" },
        { status: 401, headers: responseHeaders(id) },
      );
    }
    const body = (await request.json().catch(() => null)) as {
      activityId?: unknown;
    } | null;
    const activityId = activityIdSchema.safeParse(body?.activityId);
    if (!activityId.success) {
      return Response.json(
        {
          message:
            "Activity পাওয়া যায়নি। পৃষ্ঠাটি refresh করে আবার চেষ্টা করুন।",
        },
        { status: 400, headers: responseHeaders(id) },
      );
    }
    if (!(await restoreDailyActivity(user.id, activityId.data))) {
      return Response.json(
        {
          message:
            "Activity Restore করা যায়নি। পৃষ্ঠাটি refresh করে আবার চেষ্টা করুন।",
        },
        { status: 409, headers: responseHeaders(id) },
      );
    }
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidatePath("/reports");
    return Response.json(
      { message: "Activity Restore হয়েছে।" },
      { headers: responseHeaders(id) },
    );
  } catch {
    writeLog("error", {
      event: "api_failure",
      requestId: id,
      route: "/api/settings/activities/restore",
      status: 500,
    });
    return Response.json(
      {
        message:
          "এখন Activity Restore করা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।",
      },
      { status: 500, headers: responseHeaders(id) },
    );
  }
}
