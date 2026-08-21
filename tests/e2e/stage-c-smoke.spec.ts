import { test, expect } from "@playwright/test";

test.describe("Stage C smoke", () => {
  test("publications studio redirects signed-out users", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/user/publications");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("next=");
  });

  test("unknown publication slug is not a server error", async ({ page }) => {
    const res = await page.goto("/pubs/nonexistent-stage-c-pub");
    expect(res?.status()).toBeLessThan(500);
  });

  test("resend webhook rejects when secret missing or unsigned", async ({
    request,
  }) => {
    const res = await request.post("/api/webhooks/resend", {
      data: { type: "email.bounced", data: { to: ["a@example.com"] } },
    });
    // 503 without secret, or 401 if secret present but signature missing
    expect([401, 503]).toContain(res.status());
  });
});
