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
    page.getByRole("heading", { level: 2, name: "St. Louis, MO" }),
  ).toBeVisible();
  await expect(page.getByText(/5 matching service assignments/)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Routing assignment conflict" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Open Territory" }),
  ).toBeVisible();
});

test("distinguishes duplicate directory identities and opens canonical detail", async ({
  page,
}) => {
  await page.goto("/directory");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Representative Directory",
    }),
  ).toBeVisible();
  await expect(page.getByText(/Showing 6 of 13 representatives/)).toBeVisible();

  await page
    .getByRole("searchbox", { name: "Search representatives" })
    .fill("Cameron Brooks");
  await expect(
    page.getByRole("heading", { name: "Cameron Brooks" }),
  ).toHaveCount(2);

  await page
    .getByRole("link", {
      name: /View Cameron Brooks, First Aid & Safety, Demo Location 202/,
    })
    .click();
  await expect(page).toHaveURL(/\/directory\/rep-cameron-brooks-first-aid$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Cameron Brooks" }),
  ).toBeVisible();
  await expect(
    page.getByText(/Send Lead preselects this representative only/),
  ).toBeVisible();

  const accessibilityResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityResults.violations).toEqual([]);
});
