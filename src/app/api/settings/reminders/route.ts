import { revalidatePath } from "next/cache";

import { updateReminderSettings } from "@/features/auth/repositories/user-repository";
import { reminderSettingsSchema } from "@/features/notifications/schema";
import { getCurrentUser } from "@/lib/auth";
import { requestId, writeLog } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = (id: string) => ({
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
          "অনুরোধটি যাচাই করা যায়নি। পৃষ্ঠাটি রিফ্রেশ করে আবার চেষ্টা করুন।",
      },
      { status: 403, headers: headers(id) },
    );
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json(
        { message: "Session শেষ হয়েছে। আবার প্রবেশ করুন।" },
        { status: 401, headers: headers(id) },
      );
    }
    const rawBody = await request.json().catch(() => null);
    const body =
      typeof rawBody === "object" && rawBody
        ? (rawBody as Record<string, unknown>)
        : {};
    const parsed = reminderSettingsSchema.safeParse({
      ...body,
      endOfDayTime:
        typeof body?.endOfDayTime === "string" && body.endOfDayTime
          ? body.endOfDayTime
          : user.reminders.endOfDayTime,
      dailySummaryTime:
        typeof body?.dailySummaryTime === "string" && body.dailySummaryTime
          ? body.dailySummaryTime
          : user.reminders.dailySummaryTime,
    });
    if (!parsed.success) {
      return Response.json(
        { message: "Reminder-এর তথ্য ও সময় ঠিকভাবে দিন।" },
        { status: 400, headers: headers(id) },
      );
    }
    if (!(await updateReminderSettings(user.id, parsed.data))) {
      return Response.json(
        { message: "Reminder Settings সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।" },
        { status: 409, headers: headers(id) },
      );
    }
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return Response.json(
      { message: "Reminder Settings সংরক্ষণ হয়েছে।" },
      { headers: headers(id) },
    );
  } catch {
    writeLog("error", {
      event: "api_failure",
      requestId: id,
      route: "/api/settings/reminders",
      status: 500,
    });
    return Response.json(
      {
        message:
          "এখন Reminder সংরক্ষণ করা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।",
      },
      { status: 500, headers: headers(id) },
    );
  }
}
