import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { redeemInviteAction } from "@/features/connections/actions";
import { previewConnectionInvite } from "@/features/connections/repository";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "সংযোগের Invitation" };
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
        {preview?.alreadyConnected ? (
          <>
            <span>ইতিমধ্যেই সংযুক্ত</span>
            <h1>{preview.inviterName}-এর সঙ্গে আপনার সংযোগ আগে থেকেই আছে</h1>
            <p>
              নতুন করে নিশ্চিত করার প্রয়োজন নেই। সংযোগের পাতা থেকে শেয়ার করা
              তথ্য ও অনুমতি দেখুন।
            </p>
            <Link
              className="activity-button activity-button-primary"
              href="/connections"
            >
              সংযোগগুলো দেখুন
            </Link>
          </>
        ) : preview && redeem ? (
          <>
            <span>সংযোগের Invitation</span>
            <h1>{preview.inviterName} আপনার সঙ্গে যুক্ত হতে চান</h1>
            <p>
              নিশ্চিত করলে সংযোগ তৈরি হবে এবং আজকের Daily Activities ডিফল্টভাবে
              share হবে। আজকের Timeline দেখাতে চাইলে সংযোগের পাতা থেকে আলাদাভাবে
              permission চালু করতে হবে।
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
            <span>Invitation পাওয়া যায়নি</span>
            <h1>লিংকটি আর সক্রিয় নেই</h1>
            <p>Invitation-টি ব্যবহৃত, বাতিল বা মেয়াদোত্তীর্ণ হতে পারে।</p>
          </>
        )}
      </section>
    </main>
  );
}
