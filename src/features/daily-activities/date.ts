export function dateKeyForTimezone(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${value.year}-${value.month}-${value.day}`;
}

export function parseDateKey(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
    ? null
    : date;
}

export function weekdayForDateKey(value: string): number | null {
  return parseDateKey(value)?.getUTCDay() ?? null;
}

export function shiftDateKey(value: string, days: number): string | null {
  const date = parseDateKey(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function allowedDateKey(
  candidate: string | undefined,
  todayKey: string,
): string {
  return candidate && parseDateKey(candidate) && candidate <= todayKey
    ? candidate
    : todayKey;
}
