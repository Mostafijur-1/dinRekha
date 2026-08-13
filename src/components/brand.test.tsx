import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Brand } from "@/components/brand";

describe("Brand", () => {
  it("links the Bangla brand name to the home page", () => {
    render(<Brand />);

    expect(screen.getByRole("link", { name: "দিনরেখা হোম" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByText("দিনরেখা")).toBeVisible();
  });
});
