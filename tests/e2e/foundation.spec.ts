import { expect, test } from "@playwright/test";

test("the Bangla landing page leads to the application shell", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/ছন্দ/);
  await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  await page.getByRole("link", { name: /আজকের দিন দেখুন/ }).click();
  await expect(
    page.getByRole("heading", { name: "আপনার Dashboard এখানে তৈরি হবে।" }),
  ).toBeVisible();
});
