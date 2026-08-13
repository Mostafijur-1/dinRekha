import { parseDateKey, shiftDateKey } from "@/features/daily-activities/date";

export type ReportRangeMode = "week" | "month" | "custom";

export type ReportRange = {
  mode: ReportRangeMode;
  start: string;
  end: string;
  dateKeys: string[];
};

function dateKeysBetween(start: string, end: string): string[] {
  const keys: string[] = [];
  let cursor: string | null = start;
  while (cursor && cursor <= end && keys.length < 90) {
    keys.push(cursor);
    cursor = shiftDateKey(cursor, 1);
  }
  return keys;
}

export function resolveReportRange(
  query: { range?: string; start?: string; end?: string },
  todayKey: string,
): ReportRange {
  if (query.range === "month") {
    const start = `${todayKey.slice(0, 7)}-01`;
    return {
      mode: "month",
      start,
      end: todayKey,
      dateKeys: dateKeysBetween(start, todayKey),
    };
  }

  if (
    query.range === "custom" &&
    query.start &&
    query.end &&
    parseDateKey(query.start) &&
    parseDateKey(query.end)
  ) {
    const end = query.end > todayKey ? todayKey : query.end;
    if (query.start <= end) {
      const earliest = shiftDateKey(end, -89)!;
      const start = query.start < earliest ? earliest : query.start;
      return {
        mode: "custom",
        start,
        end,
        dateKeys: dateKeysBetween(start, end),
      };
    }
  }

  const start = shiftDateKey(todayKey, -6)!;
  return {
    mode: "week",
    start,
    end: todayKey,
    dateKeys: dateKeysBetween(start, todayKey),
  };
}
