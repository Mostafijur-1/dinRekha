import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-auth/react", () => ({ signIn: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { AuthForm } from "@/features/auth/components/auth-form";

describe("AuthForm", () => {
  it("renders an accessible Bangla registration form with Google when configured", () => {
    render(<AuthForm mode="sign-up" googleEnabled />);

    expect(
      screen.getByRole("heading", { name: "নিজের ছন্দ শুরু করুন" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Google দিয়ে চালিয়ে যান" }),
    ).toBeEnabled();
    expect(screen.getByLabelText("নাম")).toBeRequired();
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "minLength",
      "12",
    );
  });
});
