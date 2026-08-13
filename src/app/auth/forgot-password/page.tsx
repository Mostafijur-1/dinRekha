import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata = { title: "Password পুনরুদ্ধার" };

export default function ForgotPasswordPage() {
  return <AuthForm mode="forgot-password" />;
}
