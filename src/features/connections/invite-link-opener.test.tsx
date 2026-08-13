import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { InviteLinkOpener } from "@/features/connections/invite-link-opener";

describe("InviteLinkOpener", () => {
  beforeEach(() => push.mockClear());

  it("opens a valid local invite URL", () => {
    render(<InviteLinkOpener />);
    fireEvent.change(screen.getByLabelText("আপনার কাছে আসা আমন্ত্রণের লিংক"), {
      target: {
        value:
          "http://localhost:3000/connections/invite?code=abcdefghijklmnopqrstuvwx",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "লিংক খুলুন" }));
    expect(push).toHaveBeenCalledWith(
      "/connections/invite?code=abcdefghijklmnopqrstuvwx",
    );
  });

  it("extracts only the code and always opens the internal invite route", () => {
    render(<InviteLinkOpener />);
    fireEvent.change(screen.getByLabelText("আপনার কাছে আসা আমন্ত্রণের লিংক"), {
      target: {
        value:
          "https://example.com/connections/invite?code=abcdefghijklmnopqrstuvwx",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "লিংক খুলুন" }));
    expect(push).toHaveBeenCalledWith(
      "/connections/invite?code=abcdefghijklmnopqrstuvwx",
    );
  });

  it("rejects a URL that is not an invite path", () => {
    render(<InviteLinkOpener />);
    fireEvent.change(screen.getByLabelText("আপনার কাছে আসা আমন্ত্রণের লিংক"), {
      target: {
        value:
          "https://example.com/not-an-invite?code=abcdefghijklmnopqrstuvwx",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "লিংক খুলুন" }));
    expect(screen.getByRole("alert")).toHaveTextContent("সঠিক আমন্ত্রণের লিংক");
    expect(push).not.toHaveBeenCalled();
  });
});
