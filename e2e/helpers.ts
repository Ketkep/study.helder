import { expect, type Page } from "@playwright/test";

const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";

export function uniqueEmail(prefix = "e2e"): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${random}@example.com`;
}

type MailpitSummary = { ID: string; Subject: string; Created: string };

/** Subjects of Supabase's default emails, and of our own templates. */
export const CONFIRM_SUBJECT = /Confirm your (email|signup)|Bevestig je account/i;
export const RESET_SUBJECT = /Reset your password|Nieuw wachtwoord kiezen/i;

/**
 * Waits for the newest email to `to` whose subject matches, and returns the
 * confirm or reset link in it (Supabase's /verify link or our token_hash link).
 */
export async function getEmailLink(to: string, subject: RegExp): Promise<string> {
  let link: string | undefined;
  await expect
    .poll(
      async () => {
        const search = await fetch(`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`);
        if (!search.ok) return undefined;
        const { messages } = (await search.json()) as { messages: MailpitSummary[] };
        const match = messages
          .filter((message) => subject.test(message.Subject))
          .sort((a, b) => b.Created.localeCompare(a.Created))[0];
        if (!match) return undefined;
        const detail = await fetch(`${MAILPIT_URL}/api/v1/message/${match.ID}`);
        const { HTML } = (await detail.json()) as { HTML: string };
        const href = HTML.match(/href="([^"]*(?:\/auth\/v1\/verify|token_hash=)[^"]*)"/)?.[1];
        link = href?.replaceAll("&amp;", "&");
        return link;
      },
      { timeout: 20_000, message: `email "${subject}" to ${to}` },
    )
    .toBeTruthy();
  return link!;
}

export async function signUp(page: Page, email: string, password: string) {
  await page.goto("/nl/signup");
  await page.getByLabel("E-mailadres").fill(email);
  await page.getByLabel("Wachtwoord").fill(password);
  await page.getByLabel("Ik ben 16 jaar of ouder").check();
  await page.getByRole("button", { name: "Account maken" }).click();
  await expect(page).toHaveURL(/\/nl\/signup\/check-email$/);
}

export async function logIn(
  page: Page,
  email: string,
  password: string,
  { locale = "nl", navigate = true }: { locale?: "nl" | "en"; navigate?: boolean } = {},
) {
  if (navigate) await page.goto(`/${locale}/login`);
  await page.getByLabel(locale === "nl" ? "E-mailadres" : "Email address").fill(email);
  await page.getByLabel(locale === "nl" ? "Wachtwoord" : "Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: locale === "nl" ? "Inloggen" : "Log in" }).click();
}

/** Signs up and confirms through the email link. Ends signed in on the dashboard. */
export async function createConfirmedUser(page: Page, password = "study-e2e-password") {
  const email = uniqueEmail();
  await signUp(page, email, password);
  const link = await getEmailLink(email, CONFIRM_SUBJECT);
  await page.goto(link);
  await expect(page).toHaveURL(/\/nl\/dashboard$/);
  return { email, password };
}

export async function openAccountMenuIfPhone(page: Page) {
  const menuButton = page.getByRole("button", { name: "Accountmenu" });
  if (await menuButton.isVisible()) await menuButton.click();
}
