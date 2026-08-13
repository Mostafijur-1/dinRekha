import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser, updateReminderSettings, revalidatePath } = vi.hoisted(
  () => ({
    getCurrentUser: vi.fn(),
    updateReminderSettings: vi.fn(),
    revalidatePath: vi.fn(),
  }),
);

vi.mock("@/lib/auth", () => ({ getCurrentUser }));
vi.mock("@/features/auth/repositories/user-repository", () => ({
  updateReminderSettings,
}));
vi.mock("next/cache", () => ({ revalidatePath }));

import { updateReminderSettingsAction } from "@/features/notifications/actions";
import { initialSettingsActionState } from "@/features/settings/action-state";

function validForm() {
  const form = new FormData();
  form.set("activity", "on");
  form.set("endOfDay", "on");
  form.set("endOfDayTime", "21:30");
  form.set("dailySummaryTime", "22:00");
  return form;
}

describe("reminder settings action", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not write settings without an authenticated user", async () => {
    getCurrentUser.mockResolvedValue(null);
    const result = await updateReminderSettingsAction(
      initialSettingsActionState,
      validForm(),
    );
    expect(result.status).toBe("error");
    expect(updateReminderSettings).not.toHaveBeenCalled();
  });

  it("uses the authenticated owner and validated switches", async () => {
    getCurrentUser.mockResolvedValue({
      id: "owner",
      reminders: { endOfDayTime: "21:30", dailySummaryTime: "22:00" },
    });
    updateReminderSettings.mockResolvedValue(true);
    const result = await updateReminderSettingsAction(
      initialSettingsActionState,
      validForm(),
    );
    expect(result.status).toBe("success");
    expect(updateReminderSettings).toHaveBeenCalledWith("owner", {
      activity: true,
      endOfDay: true,
      dailySummary: false,
      streak: false,
      endOfDayTime: "21:30",
      dailySummaryTime: "22:00",
    });
  });

  it("keeps saved times when optional time inputs are empty", async () => {
    getCurrentUser.mockResolvedValue({
      id: "owner",
      reminders: { endOfDayTime: "20:45", dailySummaryTime: "22:15" },
    });
    updateReminderSettings.mockResolvedValue(true);
    const form = validForm();
    form.set("endOfDayTime", "");
    form.set("dailySummaryTime", "");

    await expect(
      updateReminderSettingsAction(initialSettingsActionState, form),
    ).resolves.toMatchObject({ status: "success" });
    expect(updateReminderSettings).toHaveBeenCalledWith(
      "owner",
      expect.objectContaining({
        endOfDayTime: "20:45",
        dailySummaryTime: "22:15",
      }),
    );
  });
});
