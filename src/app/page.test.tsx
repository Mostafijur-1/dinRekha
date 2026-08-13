import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home page", () => {
  it("presents the product purpose and a route into the application", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /সময় কোথায় যায়/ }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /আজকের দিন দেখুন/ }),
    ).toHaveAttribute("href", "/dashboard");
  });
});
