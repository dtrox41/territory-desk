import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("renders the fictional shell without detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Home",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Fictional Prototype — Do not enter real employee or customer information",
    ),
  ).toBeVisible();
  await expect(
    page
      .getByRole("link", {
        name: "Notifications, 3 unread notifications",
      })
      .filter({ visible: true }),
  ).toBeVisible();

  const accessibilityResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityResults.violations).toEqual([]);
});

test("navigates to a primary route and renders a safe not-found page", async ({
  page,
}) => {
  await page.goto("/");

  await page
    .getByRole("link", { name: "Send Lead" })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(/\/leads\/new$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Send Lead" }),
  ).toBeVisible();

  await page.goto("/route-that-does-not-exist");
  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Return to Home" }),
  ).toBeVisible();
});
