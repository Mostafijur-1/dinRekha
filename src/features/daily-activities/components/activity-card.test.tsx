import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/daily-activities/actions", () => ({
  archiveActivityAction: vi.fn(),
  reorderActivityAction: vi.fn(),
  setProgressAction: vi.fn(),
}));

import { setProgressAction } from "@/features/daily-activities/actions";
import { ActivityCard } from "@/features/daily-activities/components/activity-card";

describe("ActivityCard counter input", () => {
  it("updates the direct input immediately when step controls are used", async () => {
    render(
      <ActivityCard
        dateKey="2026-08-14"
        canManage={false}
        activity={{
          id: "689df5b7c86e59b05192b886",
          name: "পানি পান",
          category: "স্বাস্থ্য",
          measurement: "counter",
          target: 8,
          frequency: "daily",
          days: [],
          reminderEnabled: false,
          value: 3,
          completed: false,
          canMoveUp: false,
          canMoveDown: false,
        }}
      />,
    );

    const input = screen.getByLabelText("সরাসরি সংখ্যা লিখুন");
    expect(input).toHaveValue(3);
    fireEvent.click(screen.getByRole("button", { name: "এক বাড়ান" }));
    expect(input).toHaveValue(4);
    fireEvent.click(screen.getByRole("button", { name: "এক বাড়ান" }));
    expect(input).toHaveValue(5);
    await waitFor(() =>
      expect(vi.mocked(setProgressAction)).toHaveBeenCalledTimes(2),
    );
    expect(
      vi
        .mocked(setProgressAction)
        .mock.calls.map(([, formData]) => formData.get("value")),
    ).toEqual(["4", "5"]);
    expect(screen.getByRole("button", { name: "রাখুন" })).toBeVisible();
  });
});
