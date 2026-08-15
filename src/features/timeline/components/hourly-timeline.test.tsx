import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/timeline/actions", () => ({
  createTimelineEntryAction: vi.fn(),
}));
vi.mock("@/features/timeline/components/timeline-card", () => ({
  TimelineCard: () => <div>সংরক্ষিত কাজ</div>,
}));

import { HourlyTimeline } from "@/features/timeline/components/hourly-timeline";

describe("HourlyTimeline", () => {
  it("renders every hour and prefills work from that time's history", () => {
    const { container } = render(
      <HourlyTimeline
        entries={[
          {
            id: "64f000000000000000000001",
            activity: "রাতের পুরোনো কাজ",
            category: "কাজ",
            startMinute: 60,
            endMinute: 120,
            startTime: "01:00",
            endTime: "02:00",
            status: "completed",
            duration: 60,
          },
          {
            id: "64f000000000000000000002",
            activity: "আরেকটি পুরোনো কাজ",
            category: "কাজ",
            startMinute: 180,
            endMinute: 240,
            startTime: "03:00",
            endTime: "04:00",
            status: "completed",
            duration: 60,
          },
        ]}
        dateKey="2026-08-13"
        boundary={1440}
        isToday={false}
        suggestions={[
          {
            activity: "সকালের পড়া",
            category: "শেখা",
            uses: 4,
            lastUsedDate: "2026-08-12",
            typicalStartMinute: 600,
            reason: "এই সময়ের পরিচিত কাজ",
          },
        ]}
      />,
    );

    expect(container.querySelectorAll(".timeline-hour-slot")).toHaveLength(20);
    expect(screen.getByText("00:00–05:00")).toBeVisible();
    expect(screen.getByRole("heading", { name: "ঘুম" })).toBeVisible();
    expect(container.querySelectorAll(".timeline-default-sleep")).toHaveLength(
      1,
    );
    expect(screen.queryByText("সংরক্ষিত কাজ")).not.toBeInTheDocument();
    const sleepSlot = screen.getByText("00:00–05:00").closest("article");
    expect(
      within(sleepSlot!).queryByText("এই ঘণ্টায় কী করেছেন লিখুন"),
    ).not.toBeInTheDocument();
    expect(within(sleepSlot!).queryByRole("textbox")).not.toBeInTheDocument();
    const tenOClockSlot = screen.getByText("10:00").closest("article");
    expect(tenOClockSlot).not.toBeNull();
    fireEvent.click(
      within(tenOClockSlot!).getByText("এই ঘণ্টায় কী করেছেন লিখুন"),
    );
    fireEvent.click(
      within(tenOClockSlot!).getByRole("button", { name: /সকালের পড়া/ }),
    );

    expect(
      within(tenOClockSlot!).getByRole("textbox", {
        name: /কী করেছেন/,
      }),
    ).toHaveValue("সকালের পড়া");
    expect(
      tenOClockSlot!.querySelector<HTMLInputElement>('input[name="startTime"]'),
    ).toHaveValue("10:00");
    expect(
      tenOClockSlot!.querySelector<HTMLInputElement>('input[name="category"]'),
    ).toHaveValue("শেখা");
    expect(
      tenOClockSlot!.querySelector<HTMLInputElement>('input[name="endTime"]'),
    ).toHaveValue("11:00");
    expect(within(tenOClockSlot!).queryByText("শেখা")).not.toBeInTheDocument();
    expect(
      within(tenOClockSlot!).queryByText(/সময় স্বয়ংক্রিয়/),
    ).not.toBeInTheDocument();
  });

  it("keeps future hours visible but unavailable", () => {
    render(
      <HourlyTimeline
        entries={[]}
        dateKey="2026-08-13"
        boundary={630}
        isToday
        suggestions={[]}
      />,
    );

    const futureSlot = screen.getByText("11:00").closest("article");
    expect(futureSlot).not.toBeNull();
    expect(within(futureSlot!).getByText("এই সময় এখনো আসেনি")).toBeVisible();
    expect(
      within(futureSlot!).queryByText("এই ঘণ্টায় কী করেছেন লিখুন"),
    ).not.toBeInTheDocument();
  });

  it("keeps the current hour in progress and closes the final past-day hour at 23:59", () => {
    const { rerender } = render(
      <HourlyTimeline
        entries={[]}
        dateKey="2026-08-13"
        boundary={630}
        isToday
        suggestions={[]}
      />,
    );

    const currentSlot = screen.getByText("10:00").closest("article");
    expect(
      currentSlot!.querySelector<HTMLInputElement>('input[name="endTime"]'),
    ).toHaveValue("");

    rerender(
      <HourlyTimeline
        entries={[]}
        dateKey="2026-08-12"
        boundary={1440}
        isToday={false}
        suggestions={[]}
      />,
    );
    const finalSlot = screen.getByText("23:00").closest("article");
    expect(
      finalSlot!.querySelector<HTMLInputElement>('input[name="endTime"]'),
    ).toHaveValue("23:59");
  });

  it("offers each hour independently of an earlier long-running entry", () => {
    render(
      <HourlyTimeline
        entries={[
          {
            id: "64f000000000000000000001",
            activity: "দীর্ঘ মিটিং",
            category: "কাজ",
            startMinute: 540,
            endMinute: 660,
            startTime: "09:00",
            endTime: "11:00",
            status: "completed",
            duration: 120,
          },
        ]}
        dateKey="2026-08-13"
        boundary={1440}
        isToday={false}
        suggestions={[]}
      />,
    );

    const tenOClockSlot = screen.getByText("10:00").closest("article");
    expect(
      within(tenOClockSlot!).getByText("এই ঘণ্টায় কী করেছেন লিখুন"),
    ).toBeVisible();
  });
});
