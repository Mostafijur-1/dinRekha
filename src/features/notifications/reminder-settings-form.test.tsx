import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReminderSettingsForm } from "@/features/notifications/reminder-settings-form";

describe("ReminderSettingsForm", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("submits switches even when time inputs are empty", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ message: "Reminder Settings সংরক্ষণ হয়েছে।" }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
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
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/settings/reminders",
        expect.objectContaining({ method: "POST" }),
      ),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "সংরক্ষণ হয়েছে",
    );
  });

  it("shows a recoverable message when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
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

    fireEvent.click(
      screen.getByRole("button", { name: "Reminder সংরক্ষণ করুন" }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Network সমস্যার কারণে",
    );
  });
});
