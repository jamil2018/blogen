import { test, expect } from "@playwright/test";

test.describe("Stage B smoke", () => {
  test("following redirects signed-out users to login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/following");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("next=");
  });

  test("site header exposes Following nav", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Following" }).first()
    ).toBeVisible();
  });

  test("policy and explore remain reachable after Stage B", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header").first()).toBeVisible();
    await page.goto("/privacy");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("slug route path is registered", async ({ page }) => {
    // Unknown slug redirects home (no 404 crash)
    const res = await page.goto("/p/nonexistent-stage-b-slug");
    expect(res?.status()).toBeLessThan(500);
  });
});
