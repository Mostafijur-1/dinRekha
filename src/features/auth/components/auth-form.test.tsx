import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-auth/react", () => ({ signIn: vi.fn() }));

import { AuthForm } from "@/features/auth/components/auth-form";

describe("AuthForm", () => {
  it("renders Google as the only registration method", () => {
    render(<AuthForm mode="sign-up" googleEnabled />);

    expect(
      screen.getByRole("heading", { name: "নিজের দিনরেখা শুরু করুন" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Google দিয়ে account তৈরি করুন" }),
    ).toBeEnabled();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("disables Google authentication when credentials are not configured", () => {
    render(<AuthForm mode="sign-in" />);

    expect(
      screen.getByRole("button", { name: "Google দিয়ে প্রবেশ করুন" }),
    ).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Google প্রবেশ এখনো configure করা হয়নি।",
    );
  });
});
