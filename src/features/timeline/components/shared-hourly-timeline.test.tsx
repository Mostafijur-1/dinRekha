import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SharedHourlyTimeline } from "@/features/timeline/components/shared-hourly-timeline";

describe("SharedHourlyTimeline", () => {
  it("uses the same hourly layout without repeating time or category", () => {
    const { container } = render(
      <SharedHourlyTimeline
        boundary={630}
        entries={[
          {
            id: "64f000000000000000000001",
            activity: "পড়াশোনা",
            category: "শেখা",
            startMinute: 600,
            startTime: "10:00",
            endTime: "",
            status: "in_progress",
            duration: 0,
          },
        ]}
      />,
    );

    expect(container.querySelectorAll(".timeline-hour-slot")).toHaveLength(20);
    const currentSlot = screen.getByText("10:00").closest("article")!;
    expect(
      within(currentSlot).getByRole("heading", { name: "পড়াশোনা" }),
    ).toBeVisible();
    expect(within(currentSlot).queryByText("শেখা")).not.toBeInTheDocument();
    expect(within(currentSlot).getAllByText("10:00")).toHaveLength(1);
    expect(screen.getByText("00:00–05:00")).toBeVisible();
    expect(screen.getByRole("heading", { name: "ঘুম" })).toBeVisible();
  });
});
