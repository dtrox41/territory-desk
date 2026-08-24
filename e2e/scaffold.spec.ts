import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("renders the fictional shell without detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Good morning, Taylor",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Action Required" }),
  ).toBeVisible();
  await expect(page.getByText("Response target missed")).toBeVisible();
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

test("validates and accepts fictional territory search criteria", async ({
  page,
}) => {
  await page.goto("/territory");

  const searchInput = page.getByRole("combobox", {
    name: "ZIP code or city",
  });
  await searchInput.fill("631");
  await page.getByRole("button", { name: "Find Territory" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Enter all five ZIP-code digits before searching.",
  );

  await searchInput.fill("63101");
  await page.getByRole("button", { name: "Find Territory" }).click();
  await expect(page).toHaveURL(/zip=63101/);
  await expect(
    page.getByRole("heading", { name: "Search criteria accepted" }),
  ).toBeVisible();
});
