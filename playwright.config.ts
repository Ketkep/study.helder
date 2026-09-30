import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * End-to-end tests run against the app with a local Supabase
 * (`npx supabase start`). Emails are read from the local Mailpit inbox.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  timeout: 60_000,
  use: {
    baseURL,
    locale: "nl-NL",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], locale: "nl-NL" } },
    { name: "phone", use: { ...devices["Pixel 7"], locale: "nl-NL" } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: process.env.E2E_SERVER_COMMAND ?? `npm run dev -- -p ${PORT}`,
        url: `${baseURL}/nl`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
