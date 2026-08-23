import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("renders the fictional foundation without detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "The application foundation is ready.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Fictional prototype")).toBeVisible();

  const accessibilityResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityResults.violations).toEqual([]);
});
