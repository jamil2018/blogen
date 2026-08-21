import { test, expect } from "@playwright/test";

test.describe("Stage D smoke", () => {
  test("analytics studio redirects signed-out users", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/user/analytics");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("next=");
  });

  test("memberships studio redirects signed-out users", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/user/memberships");
    await expect(page).toHaveURL(/\/login/);
  });

  test("earnings studio redirects signed-out users", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/user/earnings");
    await expect(page).toHaveURL(/\/login/);
  });

  test("stripe webhook rejects when not configured or unsigned", async ({
    request,
  }) => {
    const res = await request.post("/api/webhooks/stripe", {
      data: { id: "evt_test", type: "ping", data: { object: {} } },
    });
    // 503 without Stripe env, or 401 if configured but signature missing
    expect([401, 503]).toContain(res.status());
  });
});
