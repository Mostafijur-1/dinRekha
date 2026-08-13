import { expect, test } from "@playwright/test";

test("বাংলা application shell শুধু Google authentication দেখায়", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/ছন্দ/);
  await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  await page.getByRole("link", { name: /আজকের দিন দেখুন/ }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in/);
  await expect(
    page.getByRole("heading", { name: "আবার স্বাগতম" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Google দিয়ে প্রবেশ করুন" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);
});

test("নির্বাচিত দিনের protected URL sign-in callback-এ থাকে", async ({
  page,
}) => {
  await page.goto("/dashboard?date=2026-08-01");

  await expect(page).toHaveURL(/\/auth\/sign-in/);
  const currentUrl = new URL(page.url());
  expect(currentUrl.searchParams.get("callbackUrl")).toBe(
    "/dashboard?date=2026-08-01",
  );
});
