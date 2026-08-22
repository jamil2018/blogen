import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Stage A smoke", () => {
  test("home explore loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("header").getByLabel("Blogen")).toBeVisible();
  });

  test("policy pages are reachable", async ({ page }) => {
    for (const path of ["/privacy", "/terms", "/content-policy", "/copyright"]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("library redirects signed-out users to login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/library");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("next=");
  });

  test("home has no critical a11y violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toEqual([]);
  });
});
