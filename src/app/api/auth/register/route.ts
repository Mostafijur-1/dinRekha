import { createPasswordUser } from "@/features/auth/repositories/user-repository";
import { consumeRateLimit } from "@/features/auth/repositories/rate-limit-repository";
import { registrationSchema } from "@/features/auth/schemas";
import {
  privateJson,
  isTrustedMutationRequest,
  readJsonBody,
} from "@/lib/http";
import { hashPassword } from "@/lib/security/password";
import { getRequestAddress, privacySafeKey } from "@/lib/security/request";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  if (!isTrustedMutationRequest(request)) {
    return privateJson(
      { message: "অনুরোধটি গ্রহণ করা যায়নি।" },
      { status: 403 },
    );
  }

  try {
    const parsed = registrationSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      return privateJson(
        { message: parsed.error.issues[0]?.message ?? "তথ্যগুলো আবার দেখুন।" },
        { status: 400 },
      );
    }

    const address = getRequestAddress(request);
    const [identityLimit, addressLimit] = await Promise.all([
      consumeRateLimit({
        key: privacySafeKey(
          "register",
          address,
          parsed.data.email.toLowerCase(),
        ),
        limit: 5,
        windowMs: 60 * 60 * 1_000,
      }),
      consumeRateLimit({
        key: privacySafeKey("register-address", address),
        limit: 20,
        windowMs: 60 * 60 * 1_000,
      }),
    ]);
    if (!identityLimit.allowed || !addressLimit.allowed) {
      const retryAfterSeconds = Math.max(
        identityLimit.retryAfterSeconds,
        addressLimit.retryAfterSeconds,
      );
      return privateJson(
        { message: "অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSeconds) },
        },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await createPasswordUser({
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
    });

    if (!user) {
      return privateJson(
        { message: "তথ্য গ্রহণ করা হয়েছে।" },
        { status: 201 },
      );
    }

    return privateJson({ message: "তথ্য গ্রহণ করা হয়েছে।" }, { status: 201 });
  } catch {
    return privateJson(
      { message: "এই মুহূর্তে account তৈরি করা যাচ্ছে না। আবার চেষ্টা করুন।" },
      { status: 503 },
    );
  }
}
