import { test, expect } from "@playwright/test";

test.describe("Phase 2 smoke", () => {
  test("paths index loads", async ({ page }) => {
    await page.goto("/paths");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("Reading paths").first()).toBeVisible();
  });

  test("seeded reading path detail loads", async ({ page }) => {
    await page.goto("/paths/getting-started-with-blogen");
    await expect(page.getByText("Getting started with Blogen")).toBeVisible();
    await expect(page.getByText("Save path to collection")).toBeVisible();
  });

  test("new collection redirects signed-out users", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/library/collections/new");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("next=");
  });
});
