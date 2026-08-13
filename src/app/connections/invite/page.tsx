import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { redeemInviteAction } from "@/features/connections/actions";
import { previewConnectionInvite } from "@/features/connections/repository";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "সংযোগের আমন্ত্রণ" };
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
            <span>সংযোগের আমন্ত্রণ</span>
            <h1>{preview.inviterName} আপনার সঙ্গে যুক্ত হতে চান</h1>
            <p>
              নিশ্চিত করলে শুধু সংযোগ তৈরি হবে। আপনার কোনো কাজ, সময়রেখা বা
              প্রতিবেদন প্রকাশ হবে না।
            </p>
            <form action={redeem}>
              <button
                className="activity-button activity-button-primary"
                type="submit"
              >
                সংযোগ নিশ্চিত করুন
              </button>
            </form>
          </>
        ) : (
          <>
            <span>আমন্ত্রণ পাওয়া যায়নি</span>
            <h1>লিংকটি আর সক্রিয় নেই</h1>
            <p>
              আমন্ত্রণটি ব্যবহৃত, বাতিল বা মেয়াদোত্তীর্ণ হতে পারে। নতুন লিংক
              চাইুন।
            </p>
          </>
        )}
      </section>
    </main>
  );
}
