import "server-only";

import { z } from "zod";

const serverEnvironmentSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI আবশ্যক।"),
  MONGODB_DB_NAME: z.string().min(1).default("dinrekha"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET কমপক্ষে ৩২ অক্ষরের হতে হবে।"),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  VAPID_PRIVATE_KEY: z.string().min(20).optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(20).optional(),
  VAPID_SUBJECT: z.string().min(1).default("mailto:admin@dinrekha.app"),
  CRON_SECRET: z.string().min(16).optional(),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

let cachedEnvironment: ServerEnvironment | undefined;

export function getServerEnvironment(): ServerEnvironment {
  if (cachedEnvironment) return cachedEnvironment;

  const result = serverEnvironmentSchema.safeParse(process.env);

  if (!result.success) {
    const fields = result.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    throw new Error(`Server environment configuration is invalid: ${fields}`);
  }

  cachedEnvironment = result.data;
  return cachedEnvironment;
}

export function hasGoogleAuthentication(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
}
