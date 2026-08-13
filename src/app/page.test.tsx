import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home page", () => {
  it("presents the product purpose and a route into the application", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /দিন কোথায় গেল/ }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /^বিনামূল্যে শুরু করুন/ }),
    ).toHaveAttribute("href", "/auth/sign-up");
    expect(
      screen.getAllByRole("link", { name: "দিনরেখা হোম" })[0],
    ).toBeVisible();
  });
});
