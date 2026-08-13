import "server-only";

import { getServerEnvironment } from "@/lib/env.server";

export async function deliverPasswordResetEmail(input: {
  email: string;
  resetUrl: string;
}): Promise<void> {
  const environment = getServerEnvironment();
  if (!environment.RESEND_API_KEY || !environment.EMAIL_FROM) {
    throw new Error("Password reset email delivery is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${environment.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: environment.EMAIL_FROM,
      to: [input.email],
      subject: "ছন্দ Password পরিবর্তনের অনুরোধ",
      text: `আপনার ছন্দ account-এর Password পরিবর্তন করতে এই link খুলুন: ${input.resetUrl}\n\nআপনি অনুরোধ না করলে এই email উপেক্ষা করুন। Linkটি ৩০ মিনিট পর অকার্যকর হবে।`,
      html: `<div lang="bn"><p>আপনার ছন্দ account-এর Password পরিবর্তন করতে নিচের link ব্যবহার করুন।</p><p><a href="${input.resetUrl}">নতুন Password দিন</a></p><p>আপনি অনুরোধ না করলে এই email উপেক্ষা করুন। Linkটি ৩০ মিনিট পর অকার্যকর হবে।</p></div>`,
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok)
    throw new Error(
      `Password reset email delivery failed (${response.status}).`,
    );
}
