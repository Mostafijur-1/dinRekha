"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  callbackUrl?: string;
  googleEnabled?: boolean;
};

const content = {
  "sign-in": {
    title: "আবার স্বাগতম",
    description: "Google account দিয়ে আপনার ব্যক্তিগত দিনরেখায় ফিরে যান।",
    button: "Google দিয়ে প্রবেশ করুন",
  },
  "sign-up": {
    title: "নিজের দিনরেখা শুরু করুন",
    description: "Google account দিয়ে নিরাপদে নতুন account তৈরি করুন।",
    button: "Google দিয়ে account তৈরি করুন",
  },
} as const;

export function AuthForm({
  mode,
  callbackUrl = "/dashboard",
  googleEnabled = false,
}: AuthFormProps) {
  const [pending, setPending] = useState(false);
  const copy = content[mode];

  async function continueWithGoogle() {
    if (!googleEnabled || pending) return;
    setPending(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <div className="auth-card">
      <div className="auth-heading">
        <span>ব্যক্তিগত · নিরাপদ</span>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </div>

      <button
        className="auth-google"
        type="button"
        onClick={continueWithGoogle}
        disabled={!googleEnabled || pending}
      >
        <span aria-hidden="true">G</span>
        {pending ? "Google-এ নেওয়া হচ্ছে…" : copy.button}
      </button>

      {!googleEnabled && (
        <p className="auth-message is-error" role="status">
          Google প্রবেশ এখনো configure করা হয়নি।
        </p>
      )}

      <div className="auth-switch">
        {mode === "sign-in" ? (
          <p>
            নতুন ব্যবহারকারী?{" "}
            <Link href="/auth/sign-up">Account তৈরি করুন</Link>
          </p>
        ) : (
          <p>
            আগে থেকেই account আছে? <Link href="/auth/sign-in">প্রবেশ করুন</Link>
          </p>
        )}
      </div>
    </div>
  );
}
