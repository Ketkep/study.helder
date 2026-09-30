import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import nl from "@/messages/nl.json";

/** Flattens nested messages into [["auth.login.title", "Log in"], ...]. */
function flatten(value: unknown, prefix = ""): Array<[string, string]> {
  if (typeof value === "string") return [[prefix, value]];
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key));
  }
  return [];
}

const catalogs = { en: flatten(en), nl: flatten(nl) };

/** Placeholders like {email} and rich-text tags like <terms>. */
function tokens(message: string): string[] {
  const placeholders = message.match(/\{[a-zA-Z0-9_]+\}/g) ?? [];
  const tags = message.match(/<\/?[a-zA-Z]+>/g) ?? [];
  return [...placeholders, ...tags].sort();
}

// SPEC 18: banned marketing phrases, in English and Dutch.
const BANNED = [
  /revolution/i,
  /revolutie/i,
  /unlock your potential/i,
  /ontgrendel/i,
  /next level/i,
  /volgende niveau/i,
  /hoger niveau/i,
  /cutting[- ]edge/i,
  /baanbrekend/i,
  /seamless/i,
  /naadloos/i,
  /harness the power/i,
  /benut de kracht/i,
  /empower/i,
  /powered by ai/i,
];

describe("translation files", () => {
  it("have exactly the same keys in Dutch and English", () => {
    const enKeys = catalogs.en.map(([key]) => key).sort();
    const nlKeys = catalogs.nl.map(([key]) => key).sort();
    expect(nlKeys).toEqual(enKeys);
  });

  it("use the same placeholders and tags in both languages", () => {
    const nlByKey = new Map(catalogs.nl);
    for (const [key, message] of catalogs.en) {
      expect(tokens(nlByKey.get(key) ?? ""), key).toEqual(tokens(message));
    }
  });

  it("contain no empty messages", () => {
    for (const [locale, entries] of Object.entries(catalogs)) {
      for (const [key, message] of entries) {
        expect(message.trim(), `${locale}: ${key}`).not.toBe("");
      }
    }
  });

  it.each(Object.keys(catalogs))("%s contains no em dashes", (locale) => {
    const offenders = catalogs[locale as keyof typeof catalogs].filter(([, message]) => message.includes("—"));
    expect(offenders.map(([key]) => key)).toEqual([]);
  });

  it.each(Object.keys(catalogs))("%s contains no banned marketing phrases", (locale) => {
    const offenders = catalogs[locale as keyof typeof catalogs].filter(([, message]) =>
      BANNED.some((pattern) => pattern.test(message)),
    );
    expect(offenders.map(([key]) => key)).toEqual([]);
  });

  it("Dutch copy uses je/jij, never the formal u/uw", () => {
    const formal = /(^|[\s(])(u|uw|uzelf)([\s.,!?)]|$)/i;
    const offenders = catalogs.nl.filter(([, message]) => formal.test(message));
    expect(offenders.map(([key]) => key)).toEqual([]);
  });
});

describe("email templates", () => {
  const dir = join(process.cwd(), "supabase", "templates");
  it.each(readdirSync(dir).filter((file) => file.endsWith(".html")))("%s contains no em dashes", (file) => {
    expect(readFileSync(join(dir, file), "utf8")).not.toContain("—");
  });
});
