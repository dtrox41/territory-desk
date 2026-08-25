import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function enterRepresentativeDemo(page: Page, destination = "/") {
  await page.goto(destination);
  await expect(page).toHaveURL(/\/sign-in\?returnTo=/);
  await page.getByRole("button", { name: "Enter Fictional Demo" }).click();
  await page
    .getByRole("button", {
      name: "Use New Business Representative Demo",
    })
    .click();
  const destinationPath = new URL(destination, "https://territory-desk.invalid")
    .pathname;
  await expect(page).toHaveURL(
    new RegExp(`${destinationPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
  );
}

test("renders the fictional shell without detectable accessibility violations", async ({
  page,
}) => {
  await enterRepresentativeDemo(page);

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

test("enforces the fictional session and manager-only route", async ({
  page,
}) => {
  await enterRepresentativeDemo(page);
  await page.evaluate(() => {
    window.history.pushState({}, "", "/insights");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(page).toHaveURL(/\/access-denied$/);
  await expect(
    page.getByRole("heading", {
      name: "You do not have access to this page or record",
    }),
  ).toBeVisible();
  await expect(page.getByText("Team Insights")).toHaveCount(0);

  await page.goto("/signed-out");
  await expect(
    page.getByRole("heading", { name: "You are signed out" }),
  ).toBeVisible();
  await page.goto("/insights");
  await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Finsights$/);
  await page.getByRole("button", { name: "Enter Fictional Demo" }).click();
  await page
    .getByRole("button", { name: "Use Authorized Manager Demo" })
    .click();
  await expect(page).toHaveURL(/\/insights$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Team Insights" }),
  ).toBeVisible();
});

test("returns a refreshed protected route through safe sign-in", async ({
  page,
}) => {
  await enterRepresentativeDemo(page, "/leads");
  await expect(
    page.getByRole("heading", { level: 1, name: "Leads" }),
  ).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Fleads$/);
  await page.getByRole("button", { name: "Enter Fictional Demo" }).click();
  await page
    .getByRole("button", {
      name: "Use New Business Representative Demo",
    })
    .click();
  await expect(page).toHaveURL(/\/leads$/);
});

test("navigates to a primary route and renders a safe not-found page", async ({
  page,
}) => {
  await enterRepresentativeDemo(page);

  await page
    .getByRole("navigation", { name: "Quick actions" })
    .getByRole("link", { name: "Send Lead" })
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
  await enterRepresentativeDemo(page, "/territory");

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
  await enterRepresentativeDemo(page, "/directory");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Representative Directory",
    }),
  ).toBeVisible();
  await expect(page.getByText(/Showing 6 of 13 representatives/)).toBeVisible();

  await page
    .getByLabel("Search representatives", { exact: true })
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

test("revalidates territory and completes the four-step fictional lead handoff", async ({
  page,
}) => {
  await enterRepresentativeDemo(page, "/territory");
  const searchInput = page.getByRole("combobox", {
    name: "ZIP code or city",
  });
  await searchInput.fill("63101");
  await page.getByRole("button", { name: "Find Territory" }).click();
  await expect(page).toHaveURL(/zip=63101/);
  await page
    .getByRole("link", {
      name: "Send Lead to Jordan Lee for Facility Services",
    })
    .click();
  await expect(page).toHaveURL(/\/leads\/new$/);
  await expect(page.getByLabel("Customer ZIP code")).toHaveValue("63101");
  await page.getByRole("button", { name: "Check Current Assignment" }).click();
  await expect(page.getByRole("heading", { name: "Jordan Lee" })).toBeVisible();
  await page.getByRole("button", { name: "Continue to Customer" }).click();

  await page
    .getByLabel("Company or organization name")
    .fill("Fictional Packaging Group");
  await page.getByLabel("Phone available").check();
  await page.getByLabel("Customer phone").fill("555-010-1040");
  await page.getByRole("button", { name: "Continue to Opportunity" }).click();

  await page
    .getByLabel("What does the customer need?")
    .fill("Customer requested a fictional facility-services site walkthrough.");
  await page.getByLabel("Within 7 days").check();
  await page.getByRole("button", { name: "Continue to Review & Send" }).click();
  await expect(
    page.getByText(/respond by the end of the next business day/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Send Lead" }).click();

  await expect(page).toHaveURL(/\/leads\/lead-demo-\d+$/);
  await expect(
    page.getByRole("heading", { name: "Lead sent to Jordan Lee" }),
  ).toBeVisible();
  await expect(page.getByText("Pending Acceptance")).toBeVisible();

  const accessibilityResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityResults.violations).toEqual([]);
});

test("ranks personal lead work and keeps search details out of the URL", async ({
  page,
}) => {
  await enterRepresentativeDemo(page, "/leads");

  await expect(
    page.getByRole("heading", { level: 1, name: "Leads" }),
  ).toBeVisible();
  await expect(page.getByText("5 leads")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Northstar Packaging" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Respond Now" })).toBeVisible();

  await page.getByLabel("View", { exact: true }).selectOption("waiting");
  await expect(page).toHaveURL(/view=waiting/);
  await expect(page.getByText("2 leads")).toBeVisible();
  await page.getByLabel("Search this view").fill("Meadow Lane");
  await expect(page.getByText(/1 matching 2 total/)).toBeVisible();
  await expect(page).not.toHaveURL(/Meadow|search=/);

  const accessibilityResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityResults.violations).toEqual([]);
});
