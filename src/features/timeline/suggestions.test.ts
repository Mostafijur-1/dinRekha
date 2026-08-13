import { describe, expect, it } from "vitest";

import {
  rankTimelineSuggestions,
  suggestedTimeLabel,
} from "@/features/timeline/suggestions";

describe("rankTimelineSuggestions", () => {
  it("combines frequency, recency and time-of-day deterministically", () => {
    const suggestions = rankTimelineSuggestions(
      [
        {
          activity: "পড়াশোনা",
          category: "শেখা",
          uses: 3,
          lastUsedDate: "2026-08-12",
          typicalStartMinute: 540,
        },
        {
          activity: "হাঁটা",
          category: "স্বাস্থ্য",
          uses: 1,
          lastUsedDate: "2026-07-01",
          typicalStartMinute: 1080,
        },
      ],
      "2026-08-13",
      570,
    );

    expect(suggestions[0]).toMatchObject({
      activity: "পড়াশোনা",
      reason: "এই সময়ের পরিচিত কাজ",
    });
  });

  it("honors the requested result limit", () => {
    const candidates = Array.from({ length: 8 }, (_, index) => ({
      activity: `কাজ ${index}`,
      category: "কাজ",
      uses: 1,
      lastUsedDate: "2026-08-13",
      typicalStartMinute: index * 60,
    }));

    expect(
      rankTimelineSuggestions(candidates, "2026-08-13", 0, 3),
    ).toHaveLength(3);
  });

  it("rounds the historical average and presents it in Bengali", () => {
    const [suggestion] = rankTimelineSuggestions(
      [
        {
          activity: "পড়াশোনা",
          category: "শেখা",
          uses: 2,
          lastUsedDate: "2026-08-12",
          typicalStartMinute: 600.5,
        },
      ],
      "2026-08-13",
      600,
    );

    expect(suggestion.typicalStartMinute).toBe(601);
    expect(suggestedTimeLabel(suggestion.typicalStartMinute)).toBe(
      "সকাল ১০:০১",
    );
  });
});
