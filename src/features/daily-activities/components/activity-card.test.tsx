import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/daily-activities/actions", () => ({
  archiveActivityAction: vi.fn(),
  reorderActivityAction: vi.fn(),
  setProgressAction: vi.fn(),
}));

import { ActivityCard } from "@/features/daily-activities/components/activity-card";

describe("ActivityCard counter input", () => {
  it("offers step controls and a direct numeric value", () => {
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

    expect(screen.getByRole("button", { name: "−" })).toBeVisible();
    expect(screen.getByRole("button", { name: "＋" })).toBeVisible();
    expect(screen.getByLabelText("সরাসরি সংখ্যা লিখুন")).toHaveValue(3);
    expect(screen.getByRole("button", { name: "রাখুন" })).toBeVisible();
  });
});
