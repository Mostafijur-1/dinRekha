import { after } from "next/server";

import { deliverPasswordResetEmail } from "@/features/auth/mail/password-reset-mail";
import {
  removePasswordResetToken,
  replacePasswordResetToken,
} from "@/features/auth/repositories/password-reset-repository";
import { consumeRateLimit } from "@/features/auth/repositories/rate-limit-repository";
import { findUserByEmail } from "@/features/auth/repositories/user-repository";
import { forgotPasswordSchema } from "@/features/auth/schemas";
import { publicEnv } from "@/lib/env";
import {
  isTrustedMutationRequest,
  privateJson,
  readJsonBody,
} from "@/lib/http";
import { getRequestAddress, privacySafeKey } from "@/lib/security/request";
import { createOpaqueToken, hashOpaqueToken } from "@/lib/security/tokens";

export const runtime = "nodejs";
export const maxDuration = 15;

const genericMessage =
  "Accountটি থাকলে Password পরিবর্তনের নির্দেশনা email-এ পাঠানো হবে।";

export async function POST(request: Request): Promise<Response> {
  if (!isTrustedMutationRequest(request)) {
    return privateJson({ message: genericMessage }, { status: 202 });
  }

  try {
    const parsed = forgotPasswordSchema.safeParse(await readJsonBody(request));
    if (!parsed.success)
      return privateJson({ message: genericMessage }, { status: 202 });

    const rateLimit = await consumeRateLimit({
      key: privacySafeKey(
        "forgot-password",
        getRequestAddress(request),
        parsed.data.email.toLowerCase(),
      ),
      limit: 4,
      windowMs: 60 * 60 * 1_000,
    });
    if (!rateLimit.allowed) {
      return privateJson(
        { message: genericMessage },
        {
          status: 202,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        },
      );
    }

    after(async () => {
      let tokenHash: string | undefined;
      try {
        const user = await findUserByEmail(parsed.data.email);
        if (!user || user.status !== "active") return;

        const rawToken = createOpaqueToken();
        tokenHash = hashOpaqueToken(rawToken);
        await replacePasswordResetToken({
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 30 * 60 * 1_000),
        });

        const resetUrl = new URL("/auth/reset-password", publicEnv.appUrl);
        resetUrl.searchParams.set("token", rawToken);
        await deliverPasswordResetEmail({
          email: user.email,
          resetUrl: resetUrl.toString(),
        });
      } catch {
        if (tokenHash)
          await removePasswordResetToken(tokenHash).catch(() => undefined);
        console.error("Password reset email delivery failed.");
      }
    });

    return privateJson({ message: genericMessage }, { status: 202 });
  } catch {
    return privateJson({ message: genericMessage }, { status: 202 });
  }
}
