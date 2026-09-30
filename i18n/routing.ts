import { defineRouting } from "next-intl/routing";

export const locales = ["nl", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "nl";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Every page lives under /nl or /en, so both language versions can be indexed.
  localePrefix: "always",
});
