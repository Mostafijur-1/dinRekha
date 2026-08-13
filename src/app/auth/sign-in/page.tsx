import { redirect } from "next/navigation";

import { AuthForm } from "@/features/auth/components/auth-form";
import { hasGoogleAuthentication } from "@/lib/env.server";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Sign in" };

function safeCallbackUrl(value?: string): string {
  return value?.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { callbackUrl } = await searchParams;
  return (
    <AuthForm
      mode="sign-in"
      callbackUrl={safeCallbackUrl(callbackUrl)}
      googleEnabled={hasGoogleAuthentication()}
    />
  );
}
