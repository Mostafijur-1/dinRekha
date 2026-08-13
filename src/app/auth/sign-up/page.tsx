import { redirect } from "next/navigation";

import { AuthForm } from "@/features/auth/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { hasGoogleAuthentication } from "@/lib/env.server";

export const metadata = { title: "Account তৈরি করুন" };

export default async function SignUpPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <AuthForm mode="sign-up" googleEnabled={hasGoogleAuthentication()} />;
}
