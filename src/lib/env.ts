const localAppUrl = "http://localhost:3000";

type PublicUrlEnvironment = {
  NEXT_PUBLIC_APP_URL?: string;
  VERCEL_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
};

function normalizePublicUrl(value: string): string {
  const trimmed = value.trim();
  return /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
}

export function resolvePublicAppUrl(
  environment: PublicUrlEnvironment = process.env as PublicUrlEnvironment,
): URL {
  const value =
    environment.NEXT_PUBLIC_APP_URL ||
    environment.VERCEL_URL ||
    environment.VERCEL_PROJECT_PRODUCTION_URL ||
    localAppUrl;

  try {
    const url = new URL(normalizePublicUrl(value));
    if (!/^https?:$/.test(url.protocol) || url.username || url.password) {
      throw new Error("Unsupported public URL");
    }
    return url;
  } catch {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must be a valid HTTP(S) URL or hostname.",
    );
  }
}

export const publicEnv = Object.freeze({
  appUrl: resolvePublicAppUrl(),
});
