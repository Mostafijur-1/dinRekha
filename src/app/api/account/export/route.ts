import { buildAccountExport } from "@/features/account/export-repository";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return Response.json({ error: "Authentication required" }, { status: 401 });
  const data = await buildAccountExport(user);
  if (!data)
    return Response.json({ error: "Export unavailable" }, { status: 500 });
  const date = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="dinrekha-export-${date}.json"`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
