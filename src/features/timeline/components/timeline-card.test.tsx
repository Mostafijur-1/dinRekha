import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/timeline/actions", () => ({
  updateTimelineEntryAction: vi.fn(),
  deleteTimelineEntryAction: vi.fn(),
}));

import { TimelineCard } from "@/features/timeline/components/timeline-card";

describe("TimelineCard edit form", () => {
  it("offers only the activity as an editable entry field", () => {
    render(
      <TimelineCard
        dateKey="2026-08-13"
        entry={{
          id: "64f000000000000000000001",
          activity: "পড়াশোনা",
          category: "শেখা",
          startMinute: 600,
          endMinute: 660,
          startTime: "10:00",
          endTime: "11:00",
          note: "ব্যক্তিগত note",
          status: "completed",
          duration: 60,
        }}
      />,
    );

    fireEvent.click(screen.getByText("Edit"));
    expect(screen.queryByText("শেখা")).not.toBeInTheDocument();
    expect(screen.queryByText("10:00")).not.toBeInTheDocument();
    expect(screen.queryByText("11:00")).not.toBeInTheDocument();
    const form = screen.getByText("সংরক্ষণ করুন").closest("form")!;
    expect(within(form).getByRole("textbox", { name: "Activity" })).toHaveValue(
      "পড়াশোনা",
    );
    expect(
      form.querySelectorAll("input:not([type='hidden']), textarea"),
    ).toHaveLength(1);
    expect(form.querySelector('input[name="startTime"]')).toBeNull();
    expect(form.querySelector('input[name="endTime"]')).toBeNull();
    expect(form.querySelector('input[name="category"]')).toBeNull();
    expect(form.querySelector('textarea[name="note"]')).toBeNull();
  });
});
