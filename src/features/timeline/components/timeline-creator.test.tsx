import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/timeline/actions", () => ({
  createTimelineEntryAction: vi.fn(),
}));

import { TimelineCreator } from "@/features/timeline/components/timeline-creator";

describe("TimelineCreator suggestions", () => {
  it("prefills an editable entry without submitting it", () => {
    render(
      <TimelineCreator
        dateKey="2026-08-13"
        isToday
        currentMinute={615}
        suggestions={[
          {
            activity: "পড়াশোনা",
            category: "শেখা",
            uses: 4,
            lastUsedDate: "2026-08-12",
            typicalStartMinute: 600,
            reason: "এই সময়ের পরিচিত কাজ",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /পড়াশোনা/ }));

    expect(screen.getByLabelText("Activity")).toHaveValue("পড়াশোনা");
    expect(screen.getByLabelText("Category")).toHaveValue("শেখা");
    expect(screen.getByLabelText("শুরুর সময়")).toHaveValue("10:15");
  });
});
