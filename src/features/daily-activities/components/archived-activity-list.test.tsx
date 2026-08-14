import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/daily-activities/actions", () => ({
  restoreActivityAction: vi.fn(),
}));

import { ArchivedActivityList } from "@/features/daily-activities/components/archived-activity-list";

describe("ArchivedActivityList", () => {
  it("shows the archived Activity and its Restore action", () => {
    render(
      <ArchivedActivityList
        activities={[
          {
            id: "689df5b7c86e59b05192b886",
            name: "পানি পান",
            category: "স্বাস্থ্য",
          },
        ]}
      />,
    );

    expect(screen.getByText("পানি পান")).toBeVisible();
    expect(screen.getByText("স্বাস্থ্য")).toBeVisible();
    expect(screen.getByRole("button", { name: "Restore" })).toBeVisible();
  });

  it("shows an explicit empty state", () => {
    render(<ArchivedActivityList activities={[]} />);
    expect(screen.getByText("কোনো archived Activity নেই।")).toBeVisible();
  });
});
