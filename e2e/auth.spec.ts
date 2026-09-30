import { expect, test } from "@playwright/test";
import {
  CONFIRM_SUBJECT,
  createConfirmedUser,
  getEmailLink,
  logIn,
  openAccountMenuIfPhone,
  RESET_SUBJECT,
  signUp,
  uniqueEmail,
} from "./helpers";

test.describe("account", () => {
  test("signed-out visitors are sent to login and come back afterwards", async ({ page }) => {
    const { email, password } = await createConfirmedUser(page);
    await page.context().clearCookies();

    await page.goto("/nl/settings");
    await expect(page).toHaveURL(/\/nl\/login\?next=%2Fnl%2Fsettings$/);
    await logIn(page, email, password, { navigate: false });
    await expect(page).toHaveURL(/\/nl\/settings$/);
  });

  test("sign-up checks the form and requires the age confirmation", async ({ page }) => {
    await page.goto("/nl/signup");
    await page.getByLabel("E-mailadres").fill("geen-email");
    await page.getByLabel("Wachtwoord").fill("kort");
    await page.getByRole("button", { name: "Account maken" }).click();

    await expect(page.getByText("Vul een geldig e-mailadres in.")).toBeVisible();
    await expect(page.getByText("Gebruik minstens 8 tekens.")).toBeVisible();
    await expect(page.getByText("Study is voor mensen van 16 jaar en ouder.")).toBeVisible();
    // Errors are linked to their fields for screen readers.
    await expect(page.getByLabel("E-mailadres")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("E-mailadres")).toHaveAccessibleDescription("Vul een geldig e-mailadres in.");
  });

  test("sign up, confirm by email, log out and log in again", async ({ page }) => {
    const email = uniqueEmail();
    const password = "study-e2e-password";
    await signUp(page, email, password);

    // Logging in before confirming is refused with a clear message.
    await logIn(page, email, password);
    await expect(page.getByText("Bevestig eerst je e-mailadres.")).toBeVisible();

    const link = await getEmailLink(email, CONFIRM_SUBJECT);
    await page.goto(link);
    await expect(page).toHaveURL(/\/nl\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Waar wil je mee beginnen?" })).toBeVisible();

    // A confirmation link only works once.
    await page.context().clearCookies();
    await page.goto(link);
    // Supabase adds its error details after "#"; the page is what matters.
    await expect(page).toHaveURL(/\/nl\/auth-error(#.*)?$/);
    await expect(page.getByRole("heading", { name: "Deze link werkt niet meer" })).toBeVisible();

    await logIn(page, email, "wrong-password");
    await expect(page.getByText("Dat e-mailadres of wachtwoord klopt niet.")).toBeVisible();
    await expect(page.getByLabel("E-mailadres")).toHaveValue(email);

    await logIn(page, email, password);
    await expect(page).toHaveURL(/\/nl\/dashboard$/);

    await openAccountMenuIfPhone(page);
    await page.getByRole("button", { name: "Uitloggen" }).first().click();
    await expect(page).toHaveURL(/\/nl$/);
    await page.goto("/nl/dashboard");
    await expect(page).toHaveURL(/\/nl\/login/);
  });

  test("a confirmation link opened in another browser confirms the account", async ({ page, browser }) => {
    const email = uniqueEmail();
    const password = "study-e2e-password";
    await signUp(page, email, password);
    const link = await getEmailLink(email, CONFIRM_SUBJECT);

    // A fresh browser has none of the sign-up cookies, like opening the email on your phone.
    const other = await browser.newContext({ locale: "nl-NL" });
    const otherPage = await other.newPage();
    await otherPage.goto(link);
    await expect(otherPage).toHaveURL(/\/nl\/login\?notice=email-confirmed$/);
    await expect(otherPage.getByText("Je e-mailadres is bevestigd.")).toBeVisible();
    await logIn(otherPage, email, password, { navigate: false });
    await expect(otherPage).toHaveURL(/\/nl\/dashboard$/);
    await other.close();
  });

  test("the session survives a reload and a new tab", async ({ page, context }) => {
    await createConfirmedUser(page);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Waar wil je mee beginnen?" })).toBeVisible();
    const second = await context.newPage();
    await second.goto("/nl/progress");
    await expect(second.getByRole("heading", { name: "Voortgang" })).toBeVisible();
  });

  test("reset a forgotten password by email", async ({ page }) => {
    const { email } = await createConfirmedUser(page);
    await page.context().clearCookies();

    await page.goto("/nl/forgot-password");
    await page.getByLabel("E-mailadres").fill(email);
    await page.getByRole("button", { name: "Stuur link" }).click();
    await expect(page.getByText("Als er een account bij dit e-mailadres hoort")).toBeVisible();

    const link = await getEmailLink(email, RESET_SUBJECT);
    await page.goto(link);
    await expect(page).toHaveURL(/\/nl\/reset-password$/);
    await page.getByLabel("Nieuw wachtwoord").fill("a-brand-new-password");
    await page.getByRole("button", { name: "Wachtwoord opslaan" }).click();
    await expect(page).toHaveURL(/\/nl\/dashboard\?notice=password-updated$/);
    await expect(page.getByText("Je nieuwe wachtwoord is opgeslagen.")).toBeVisible();

    await page.context().clearCookies();
    await logIn(page, email, "a-brand-new-password");
    await expect(page).toHaveURL(/\/nl\/dashboard$/);
  });

  test("the forgot-password form does not reveal whether an account exists", async ({ page }) => {
    await page.goto("/nl/forgot-password");
    await page.getByLabel("E-mailadres").fill(uniqueEmail("nobody"));
    await page.getByRole("button", { name: "Stuur link" }).click();
    await expect(page.getByText("Als er een account bij dit e-mailadres hoort")).toBeVisible();
  });

  test("change password in settings requires the current password", async ({ page }) => {
    const { email, password } = await createConfirmedUser(page);
    await page.goto("/nl/settings");

    await page.getByLabel("Huidig wachtwoord").fill("not-my-password");
    await page.getByLabel("Nieuw wachtwoord").fill("another-new-password");
    await page.getByRole("button", { name: "Nieuw wachtwoord opslaan" }).click();
    await expect(page.getByText("Je huidige wachtwoord klopt niet.")).toBeVisible();

    await page.getByLabel("Huidig wachtwoord").fill(password);
    await page.getByLabel("Nieuw wachtwoord").fill("another-new-password");
    await page.getByRole("button", { name: "Nieuw wachtwoord opslaan" }).click();
    await expect(page.getByText("Je nieuwe wachtwoord is opgeslagen.")).toBeVisible();

    await page.context().clearCookies();
    await logIn(page, email, "another-new-password");
    await expect(page).toHaveURL(/\/nl\/dashboard$/);
  });

  test("the chosen language is saved to the account", async ({ page }) => {
    const { email, password } = await createConfirmedUser(page);
    await page.goto("/nl/settings");
    await page.getByLabel("English").check();
    await page.getByRole("button", { name: "Taal opslaan" }).click();
    await expect(page).toHaveURL(/\/en\/settings\?notice=language-saved$/);
    await expect(page.getByText("Language saved.")).toBeVisible();

    // Logging in from the Dutch login page lands in English.
    await page.context().clearCookies();
    await logIn(page, email, password);
    await expect(page).toHaveURL(/\/en\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Where do you want to start?" })).toBeVisible();
  });

  test("the app navigation works on every screen size", async ({ page, isMobile }) => {
    await createConfirmedUser(page);
    const nav = page.getByRole("navigation", { name: "Hoofdmenu" }).filter({ visible: true });
    await nav.getByRole("link", { name: "Vakken" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Vakken" })).toBeVisible();
    await nav.getByRole("link", { name: "Flashcards" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Flashcards" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Flashcards" })).toHaveAttribute("aria-current", "page");

    if (isMobile) {
      await page.getByRole("button", { name: "Accountmenu" }).click();
      await page.getByRole("link", { name: "Instellingen" }).click();
    } else {
      await page.getByRole("link", { name: "Instellingen" }).click();
    }
    await expect(page.getByRole("heading", { level: 1, name: "Instellingen" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("signed-in users skip the login page", async ({ page }) => {
    await createConfirmedUser(page);
    await page.goto("/nl/login");
    await expect(page).toHaveURL(/\/nl\/dashboard$/);
  });
});
