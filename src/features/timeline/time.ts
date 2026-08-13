export function timeToMinute(value: string): number {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function minuteToTime(value: number): string {
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function durationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder} মিনিট`;
  if (!remainder) return `${hours} ঘণ্টা`;
  return `${hours} ঘণ্টা ${remainder} মিনিট`;
}

export function currentMinuteForTimezone(date: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return Number(values.hour) * 60 + Number(values.minute);
}

export type TimelineGap = { startMinute: number; endMinute: number };

export function timelineGaps(
  entries: Array<{ startMinute: number; endMinute?: number }>,
  boundary = 1440,
): TimelineGap[] {
  const gaps: TimelineGap[] = [];
  let cursor = 0;
  for (const entry of entries) {
    if (entry.startMinute > cursor) {
      gaps.push({ startMinute: cursor, endMinute: entry.startMinute });
    }
    cursor = Math.max(cursor, entry.endMinute ?? boundary);
  }
  if (cursor < boundary)
    gaps.push({ startMinute: cursor, endMinute: boundary });
  return gaps;
}
