import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeContent } from "@/app/page";

describe("Home page", () => {
  it("presents the product purpose and a route into the application", () => {
    render(<HomeContent user={null} />);

    expect(
      screen.getByRole("heading", { name: /প্রতিদিনের সময় ও অভ্যাস/ }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /^Google দিয়ে শুরু করুন/ }),
    ).toHaveAttribute("href", "/auth/sign-up");
    expect(
      screen.getAllByRole("link", { name: "দিনরেখা হোম" })[0],
    ).toBeVisible();
  });

  it("welcomes a signed-in user by their exact saved name", () => {
    render(
      <HomeContent
        user={{ name: "মোস্তাফিজুর রহমান", timezone: "Asia/Dhaka" }}
      />,
    );

    expect(screen.getAllByText(/মোস্তাফিজুর রহমান/).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: /আজকের দিন দেখুন/ }),
    ).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "ড্যাশবোর্ড" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });
});
