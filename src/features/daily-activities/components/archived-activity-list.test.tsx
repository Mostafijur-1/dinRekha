import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

import { ArchivedActivityList } from "@/features/daily-activities/components/archived-activity-list";

describe("ArchivedActivityList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("restores through the API and refreshes Settings", async () => {
    const request = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "Activity Restore হয়েছে।" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", request);
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

    fireEvent.click(screen.getByRole("button", { name: "Restore" }));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(request).toHaveBeenCalledWith(
      "/api/settings/activities/restore",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ activityId: "689df5b7c86e59b05192b886" }),
      }),
    );
    expect(screen.getByText("Activity Restore হয়েছে।")).toBeVisible();
  });

  it("shows the API error without entering the application error boundary", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ message: "Activity Restore করা যায়নি।" }),
            { status: 409, headers: { "content-type": "application/json" } },
          ),
        ),
    );
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

    fireEvent.click(screen.getByRole("button", { name: "Restore" }));

    expect(
      await screen.findByText("Activity Restore করা যায়নি।"),
    ).toBeVisible();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("shows an explicit empty state", () => {
    render(<ArchivedActivityList activities={[]} />);
    expect(screen.getByText("কোনো archived Activity নেই।")).toBeVisible();
  });
});
