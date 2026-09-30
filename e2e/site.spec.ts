import { expect, test } from "@playwright/test";

test.describe("landing page and language", () => {
  test("the root sends Dutch browsers to /nl", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/nl$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "nl");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Leer van je eigen materiaal.");
  });

  test("the root sends English browsers to /en", async ({ browser }) => {
    const context = await browser.newContext({ locale: "en-GB" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Learn from your own material.");
    await context.close();
  });

  test("shows the main sections and switches language", async ({ page }) => {
    await page.goto("/nl");
    await expect(page.getByRole("heading", { name: "Zo werkt het" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Zo ziet het eruit" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Wat Study doet" })).toBeVisible();

    await page.getByRole("link", { name: "View this page in English" }).first().click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Learn from your own material.");
  });

  test("the start button leads to sign-up", async ({ page }) => {
    await page.goto("/nl");
    await page.getByRole("link", { name: "Begin met leren" }).first().click();
    await expect(page).toHaveURL(/\/nl\/signup$/);
    await expect(page.getByRole("heading", { name: "Account maken" })).toBeVisible();
  });

  test("privacy and terms pages exist in both languages", async ({ page }) => {
    await page.goto("/nl/privacy");
    await expect(page.getByRole("heading", { name: "Privacyverklaring" })).toBeVisible();
    await page.goto("/en/terms");
    await expect(page.getByRole("heading", { name: "Terms of use" })).toBeVisible();
    await expect(page.getByText("Study is for people aged 16 and over.")).toBeVisible();
  });

  test("unknown pages show a translated 404", async ({ page }) => {
    const response = await page.goto("/nl/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Deze pagina bestaat niet" })).toBeVisible();
  });

  test("no Content-Security-Policy violations and no sideways scrolling", async ({ page }) => {
    const violations: string[] = [];
    page.on("console", (message) => {
      if (/Content Security Policy|Refused to/i.test(message.text())) violations.push(message.text());
    });
    await page.goto("/nl");
    await page.waitForLoadState("networkidle");
    expect(violations).toEqual([]);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("sends security headers", async ({ request }) => {
    const response = await request.get("/nl");
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("the setup self-check reports a working configuration", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.advice).toEqual([]);
    expect(body.details.database).toBe("ok");
    // Never includes the key itself.
    expect(JSON.stringify(body)).not.toContain("sb_publishable_");
  });

  test("the skip link moves focus to the main content", async ({ page, isMobile }) => {
    test.skip(isMobile, "Keyboard navigation is a desktop concern");
    await page.goto("/nl");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Naar de inhoud" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });
});
