"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type Mode = "sign-in" | "sign-up" | "forgot-password" | "reset-password";

type AuthFormProps = {
  mode: Mode;
  callbackUrl?: string;
  googleEnabled?: boolean;
  resetToken?: string;
};

const content = {
  "sign-in": {
    title: "আবার স্বাগতম",
    description: "নিজের দিনের ছন্দে ফিরতে Sign in করুন।",
    submit: "Sign in",
  },
  "sign-up": {
    title: "নিজের ছন্দ শুরু করুন",
    description: "দিন বুঝতে একটি ব্যক্তিগত account তৈরি করুন।",
    submit: "Account তৈরি করুন",
  },
  "forgot-password": {
    title: "Password ভুলে গেছেন?",
    description: "আপনার email দিলে নিরাপদ পরিবর্তনের link পাঠাব।",
    submit: "পরিবর্তনের link পাঠান",
  },
  "reset-password": {
    title: "নতুন Password দিন",
    description: "অন্য কোথাও ব্যবহার করেননি—এমন শক্তিশালী Password বেছে নিন।",
    submit: "Password পরিবর্তন করুন",
  },
} satisfies Record<
  Mode,
  { title: string; description: string; submit: string }
>;

export function AuthForm({
  mode,
  callbackUrl = "/dashboard",
  googleEnabled = false,
  resetToken = "",
}: AuthFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();
  const [isError, setIsError] = useState(false);
  const copy = content[mode];
  const showPassword =
    mode === "sign-in" || mode === "sign-up" || mode === "reset-password";

  useEffect(() => {
    if (mode === "reset-password" && resetToken) {
      window.history.replaceState({}, "", "/auth/reset-password");
    }
  }, [mode, resetToken]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(undefined);
    setIsError(false);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      if (mode === "sign-in") {
        const result = await signIn("credentials", {
          email,
          password,
          callbackUrl,
          redirect: false,
        });
        if (!result?.ok) throw new Error("Email বা Password সঠিক নয়।");
        router.push(callbackUrl);
        router.refresh();
        return;
      }

      const endpoint =
        mode === "sign-up"
          ? "/api/auth/register"
          : mode === "forgot-password"
            ? "/api/auth/forgot-password"
            : "/api/auth/reset-password";
      const payload =
        mode === "sign-up"
          ? {
              name: String(form.get("name") ?? ""),
              email,
              password,
              confirmPassword: String(form.get("confirmPassword") ?? ""),
            }
          : mode === "forgot-password"
            ? { email }
            : {
                token: resetToken,
                password,
                confirmPassword: String(form.get("confirmPassword") ?? ""),
              };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(result.message ?? "অনুরোধটি সম্পন্ন করা যায়নি।");

      if (mode === "sign-up") {
        router.push("/auth/sign-in?registration=received");
        return;
      }

      setMessage(result.message);
      if (mode === "reset-password") {
        window.setTimeout(() => router.push("/auth/sign-in?reset=1"), 1_200);
      }
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error ? error.message : "অনুরোধটি সম্পন্ন করা যায়নি।",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-heading">
        <span>ব্যক্তিগত · নিরাপদ</span>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </div>

      {googleEnabled && (mode === "sign-in" || mode === "sign-up") && (
        <>
          <button
            className="auth-google"
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            disabled={pending}
          >
            <span aria-hidden="true">G</span>
            Google দিয়ে চালিয়ে যান
          </button>
          <div className="auth-divider">
            <span>অথবা</span>
          </div>
        </>
      )}

      <form onSubmit={submit} className="auth-form">
        {mode === "sign-up" && (
          <label>
            <span>নাম</span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
            />
          </label>
        )}

        {mode !== "reset-password" && (
          <label>
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
        )}

        {showPassword && (
          <label>
            <span>
              {mode === "reset-password" ? "নতুন Password" : "Password"}
            </span>
            <input
              name="password"
              type="password"
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              required
              minLength={mode === "sign-in" ? 1 : 12}
              maxLength={128}
            />
          </label>
        )}

        {(mode === "sign-up" || mode === "reset-password") && (
          <label>
            <span>Password আবার দিন</span>
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
            />
          </label>
        )}

        {mode === "sign-in" && (
          <Link className="auth-inline-link" href="/auth/forgot-password">
            Password ভুলে গেছেন?
          </Link>
        )}

        {message && (
          <p
            className={isError ? "auth-message is-error" : "auth-message"}
            role="status"
          >
            {message}
          </p>
        )}

        <button
          className="button button-primary auth-submit"
          type="submit"
          disabled={pending}
        >
          {pending ? "অপেক্ষা করুন…" : copy.submit}
        </button>
      </form>

      <div className="auth-switch">
        {mode === "sign-in" ? (
          <p>
            Account নেই? <Link href="/auth/sign-up">নতুন account খুলুন</Link>
          </p>
        ) : mode === "sign-up" ? (
          <p>
            আগেই account আছে? <Link href="/auth/sign-in">Sign in করুন</Link>
          </p>
        ) : (
          <p>
            <Link href="/auth/sign-in">Sign in-এ ফিরে যান</Link>
          </p>
        )}
      </div>
    </div>
  );
}
