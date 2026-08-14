export type TimelineSuggestionCandidate = {
  activity: string;
  category: string;
  uses: number;
  lastUsedDate: string;
  typicalStartMinute: number;
};

export type TimelineSuggestion = TimelineSuggestionCandidate & {
  reason: string;
};

function daysBetween(dateKey: string, todayKey: string): number {
  const last = Date.parse(`${dateKey}T00:00:00Z`);
  const today = Date.parse(`${todayKey}T00:00:00Z`);
  if (!Number.isFinite(last) || !Number.isFinite(today)) return 365;
  return Math.max(0, Math.floor((today - last) / 86_400_000));
}

export function normalizeSuggestedMinute(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1439, Math.max(0, Math.round(value)));
}

export function suggestedTimeLabel(value: number): string {
  const normalized = normalizeSuggestedMinute(value);
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const period =
    hour < 6
      ? "রাত"
      : hour < 12
        ? "সকাল"
        : hour < 16
          ? "দুপুর"
          : hour < 18
            ? "বিকেল"
            : hour < 20
              ? "সন্ধ্যা"
              : "রাত";
  const hourLabel = String(hour % 12 || 12).replace(/\d/g, (digit) =>
    "০১২৩৪৫৬৭৮৯".charAt(Number(digit)),
  );
  const minuteLabel = String(minute)
    .padStart(2, "0")
    .replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯".charAt(Number(digit)));
  return `${period} ${hourLabel}:${minuteLabel}`;
}

export function rankTimelineSuggestions(
  candidates: TimelineSuggestionCandidate[],
  todayKey: string,
  currentMinute: number,
  limit = 5,
): TimelineSuggestion[] {
  return candidates
    .map((candidate) => {
      const typicalStartMinute = normalizeSuggestedMinute(
        candidate.typicalStartMinute,
      );
      const age = daysBetween(candidate.lastUsedDate, todayKey);
      const timeDistance = Math.abs(typicalStartMinute - currentMinute);
      const frequencyScore = Math.min(candidate.uses, 10) * 4;
      const recencyScore = Math.max(0, 30 - age);
      const timeScore = Math.max(0, 12 - timeDistance / 30);

      return {
        ...candidate,
        typicalStartMinute,
        score: frequencyScore + recencyScore + timeScore,
        reason:
          timeDistance <= 90
            ? "এই সময়ের পরিচিত কাজ"
            : age <= 2
              ? "সম্প্রতি করেছেন"
              : "নিয়মিত করেন",
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.lastUsedDate.localeCompare(a.lastUsedDate) ||
        b.uses - a.uses ||
        a.activity.localeCompare(b.activity, "bn"),
    )
    .slice(0, Math.max(0, limit))
    .map((suggestion) => ({
      activity: suggestion.activity,
      category: suggestion.category,
      uses: suggestion.uses,
      lastUsedDate: suggestion.lastUsedDate,
      typicalStartMinute: suggestion.typicalStartMinute,
      reason: suggestion.reason,
    }));
}

export function suggestionsForTimelineHour(
  candidates: TimelineSuggestionCandidate[],
  dateKey: string,
  hourStartMinute: number,
  limit = 4,
): TimelineSuggestion[] {
  const hourCenter = normalizeSuggestedMinute(hourStartMinute + 30);
  const nearby = candidates.filter(
    (candidate) =>
      Math.abs(
        normalizeSuggestedMinute(candidate.typicalStartMinute) - hourCenter,
      ) <= 120,
  );

  return rankTimelineSuggestions(
    nearby.length > 0 ? nearby : candidates,
    dateKey,
    hourCenter,
    limit,
  );
}
