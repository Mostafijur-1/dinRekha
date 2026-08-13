import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { updateReminderSettingsAction } = vi.hoisted(() => ({
  updateReminderSettingsAction: vi.fn(async () => ({
    status: "success" as const,
    message: "Reminder Settings সংরক্ষণ হয়েছে।",
  })),
}));

vi.mock("@/features/notifications/actions", () => ({
  updateReminderSettingsAction,
}));

import { ReminderSettingsForm } from "@/features/notifications/reminder-settings-form";

describe("ReminderSettingsForm", () => {
  it("submits switches even when time inputs are empty", async () => {
    render(
      <ReminderSettingsForm
        settings={{
          activity: true,
          endOfDay: false,
          dailySummary: false,
          streak: false,
          endOfDayTime: "21:30",
          dailySummaryTime: "22:00",
        }}
      />,
    );

    fireEvent.change(screen.getByLabelText("দিনশেষের সময়"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Summary-এর সময়"), {
      target: { value: "" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Reminder সংরক্ষণ করুন" }),
    );

    await waitFor(() =>
      expect(updateReminderSettingsAction).toHaveBeenCalled(),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "সংরক্ষণ হয়েছে",
    );
  });
});
