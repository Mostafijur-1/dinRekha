import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { redeemInviteAction } from "@/features/connections/actions";
import { previewConnectionInvite } from "@/features/connections/repository";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Connection Invite" };
export const dynamic = "force-dynamic";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const callbackUrl = code
    ? `/connections/invite?code=${encodeURIComponent(code)}`
    : "/connections/invite";
  const user = await getCurrentUser();
  if (!user)
    redirect(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  const preview = code ? await previewConnectionInvite(code, user.id) : null;
  const redeem = code ? redeemInviteAction.bind(null, code) : undefined;
  return (
    <main className="shell-page">
      <header className="shell-header">
        <Brand />
      </header>
      <section className="connection-invite-page">
        {preview && redeem ? (
          <>
            <span>Connection Invite</span>
            <h1>{preview.inviterName} connect করতে চান</h1>
            <p>
              Confirm করলে শুধু Connection তৈরি হবে। আপনার কোনো Activity,
              Timeline বা Report share হবে না।
            </p>
            <form action={redeem}>
              <button
                className="activity-button activity-button-primary"
                type="submit"
              >
                Connection নিশ্চিত করুন
              </button>
            </form>
          </>
        ) : (
          <>
            <span>Invite পাওয়া যায়নি</span>
            <h1>Link-টি আর সক্রিয় নেই</h1>
            <p>
              Invite ব্যবহৃত, বাতিল বা মেয়াদোত্তীর্ণ হতে পারে। নতুন link চাইুন।
            </p>
          </>
        )}
      </section>
    </main>
  );
}
