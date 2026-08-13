import {
  consumePasswordResetToken,
  invalidatePasswordResetTokens,
} from "@/features/auth/repositories/password-reset-repository";
import { consumeRateLimit } from "@/features/auth/repositories/rate-limit-repository";
import { updatePassword } from "@/features/auth/repositories/user-repository";
import { resetPasswordSchema } from "@/features/auth/schemas";
import {
  isTrustedMutationRequest,
  privateJson,
  readJsonBody,
} from "@/lib/http";
import { hashPassword } from "@/lib/security/password";
import { getRequestAddress, privacySafeKey } from "@/lib/security/request";
import { hashOpaqueToken } from "@/lib/security/tokens";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  if (!isTrustedMutationRequest(request)) {
    return privateJson(
      { message: "অনুরোধটি গ্রহণ করা যায়নি।" },
      { status: 403 },
    );
  }

  try {
    const parsed = resetPasswordSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      return privateJson(
        { message: parsed.error.issues[0]?.message ?? "তথ্যগুলো আবার দেখুন।" },
        { status: 400 },
      );
    }

    const rateLimit = await consumeRateLimit({
      key: privacySafeKey("reset-password", getRequestAddress(request)),
      limit: 6,
      windowMs: 30 * 60 * 1_000,
    });
    if (!rateLimit.allowed) {
      return privateJson(
        { message: "অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        },
      );
    }

    const userId = await consumePasswordResetToken(
      hashOpaqueToken(parsed.data.token),
    );
    if (!userId) {
      return privateJson(
        { message: "Linkটি অকার্যকর বা মেয়াদ শেষ। নতুন link নিন।" },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    if (!(await updatePassword(userId, passwordHash))) {
      return privateJson(
        { message: "Password পরিবর্তন করা যায়নি।" },
        { status: 400 },
      );
    }
    await invalidatePasswordResetTokens(userId);

    return privateJson({
      message: "Password পরিবর্তন হয়েছে। এখন Sign in করুন।",
    });
  } catch {
    return privateJson(
      { message: "এই মুহূর্তে Password পরিবর্তন করা যাচ্ছে না।" },
      { status: 503 },
    );
  }
}
