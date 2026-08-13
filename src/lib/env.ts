const localAppUrl = "http://localhost:3000";

function readPublicUrl(name: "NEXT_PUBLIC_APP_URL", fallback: string): URL {
  const value = process.env[name] ?? fallback;

  try {
    return new URL(value);
  } catch {
    throw new Error(`${name} must be a valid absolute URL.`);
  }
}

export const publicEnv = Object.freeze({
  appUrl: readPublicUrl("NEXT_PUBLIC_APP_URL", localAppUrl),
});
