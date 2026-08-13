import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeContent } from "@/app/page";
import { InstallProvider } from "@/features/pwa/install-provider";

function renderHome(
  user: Parameters<typeof HomeContent>[0]["user"],
  options: Omit<Parameters<typeof HomeContent>[0], "user"> = {},
) {
  return render(
    <InstallProvider>
      <HomeContent user={user} {...options} />
    </InstallProvider>,
  );
}

describe("Home page", () => {
  it("presents the product purpose and a route into the application", () => {
    renderHome(null);

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
    renderHome({ name: "মোস্তাফিজুর রহমান", timezone: "Asia/Dhaka" });

    expect(screen.getAllByText(/মোস্তাফিজুর রহমান/).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: /আজকের দিন দেখুন/ }),
    ).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "ড্যাশবোর্ড" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });

  it("shows the exact active member count", () => {
    renderHome(null, { memberCount: 1234 });

    expect(
      screen.getByText("দিনরেখায় বর্তমানে ১,২৩৪ জন সক্রিয় সদস্য আছেন।"),
    ).toBeVisible();
  });

  it("uses a signed-in user's real habits and progress", () => {
    renderHome(
      { name: "মোস্তাফিজুর রহমান", timezone: "Asia/Dhaka" },
      {
        memberCount: 12,
        activities: [
          {
            id: "activity-1",
            name: "সকালের ব্যায়াম",
            category: "স্বাস্থ্য",
            measurement: "boolean",
            target: 1,
            value: 1,
            completed: true,
          },
          {
            id: "activity-2",
            name: "বই পড়া",
            category: "শেখা",
            measurement: "duration",
            target: 30,
            unit: "মিনিট",
            preferredTime: "21:00",
            value: 10,
            completed: false,
          },
        ],
      },
    );

    expect(screen.getByLabelText("আজকের অগ্রগতি ৫০ শতাংশ")).toBeVisible();
    expect(screen.getByText("২টির মধ্যে ১টি অভ্যাস সম্পন্ন")).toBeVisible();
    expect(screen.getByText("সকালের ব্যায়াম")).toBeVisible();
    expect(screen.getAllByText("বই পড়া").length).toBeGreaterThan(0);
    expect(screen.queryByText("গভীর মনোযোগ")).not.toBeInTheDocument();
  });
});
