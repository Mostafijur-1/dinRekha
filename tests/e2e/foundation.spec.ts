import { expect, test } from "@playwright/test";

test("বাংলা application shell শুধু Google authentication দেখায়", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/দিনরেখা/);
  await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  await expect(
    page
      .getByRole("navigation", { name: "প্রধান নেভিগেশন" })
      .getByRole("link", { name: "দিনরেখা হোম" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "প্রবেশ করুন" }).click();
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

test("Report page authentication ছাড়া খোলা যায় না", async ({ page }) => {
  await page.goto("/reports");

  await expect(page).toHaveURL(/\/auth\/sign-in/);
  const currentUrl = new URL(page.url());
  expect(currentUrl.searchParams.get("callbackUrl")).toBe("/reports");
});

test("Activity history URL authentication callback-এ থাকে", async ({
  page,
}) => {
  const activityId = "64f000000000000000000001";
  await page.goto(`/reports/activities/${activityId}`);

  await expect(page).toHaveURL(/\/auth\/sign-in/);
  const currentUrl = new URL(page.url());
  expect(currentUrl.searchParams.get("callbackUrl")).toBe(
    `/reports/activities/${activityId}`,
  );
});
