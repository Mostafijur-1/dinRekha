import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata = { title: "নতুন Password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <AuthForm mode="reset-password" resetToken={token ?? ""} />;
}
