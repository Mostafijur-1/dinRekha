import { timingSafeEqual } from "node:crypto";

export function isCronAuthorized(header: string | null, secret?: string) {
  if (!secret || !header) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header);
  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}
