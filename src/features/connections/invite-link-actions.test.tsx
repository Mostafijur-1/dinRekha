import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InviteLinkActions } from "@/features/connections/invite-link-actions";

describe("InviteLinkActions", () => {
  it("shows a complete URL and copies it", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <InviteLinkActions
        appOrigin="http://localhost:3000"
        path="/connections/invite?code=abcdefghijklmnopqrstuvwx"
      />,
    );

    await waitFor(() =>
      expect(screen.getByLabelText("সম্পূর্ণ Invitation-এর লিংক")).toHaveValue(
        "http://localhost:3000/connections/invite?code=abcdefghijklmnopqrstuvwx",
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "লিংক কপি করুন" }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        "http://localhost:3000/connections/invite?code=abcdefghijklmnopqrstuvwx",
      ),
    );
  });
});
