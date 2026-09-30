import { describe, expect, it } from "vitest";
import { isGuestOnlyPath, isProtectedPath, safeNextPath, stripLocale } from "@/lib/auth/redirect";

describe("safeNextPath", () => {
  it("keeps same-site paths", () => {
    expect(safeNextPath("/nl/settings", "nl")).toBe("/nl/settings");
    expect(safeNextPath("/en/subjects?tab=learn#top", "nl")).toBe("/en/subjects?tab=learn#top");
  });

  it("adds the locale when the path has none", () => {
    expect(safeNextPath("/settings", "en")).toBe("/en/settings");
    expect(safeNextPath("/", "nl")).toBe("/nl");
  });

  it.each([
    "https://evil.example/phish",
    "//evil.example",
    "/\\evil.example",
    "\\\\evil.example",
    "javascript:alert(1)",
    "settings",
    "",
    "/nl/\u0000",
    `/${"a".repeat(600)}`,
  ])("rejects %j and falls back to the dashboard", (input) => {
    expect(safeNextPath(input, "nl")).toBe("/nl/dashboard");
  });

  it("rejects non-strings", () => {
    expect(safeNextPath(undefined, "en")).toBe("/en/dashboard");
    expect(safeNextPath(["/nl/settings"], "en")).toBe("/en/dashboard");
  });
});

describe("stripLocale", () => {
  it("splits locale and path", () => {
    expect(stripLocale("/nl/dashboard")).toEqual({ locale: "nl", path: "/dashboard" });
    expect(stripLocale("/en")).toEqual({ locale: "en", path: "/" });
  });

  it("ignores unknown locales", () => {
    expect(stripLocale("/de/dashboard")).toEqual({ locale: null, path: "/de/dashboard" });
    expect(stripLocale("/english")).toEqual({ locale: null, path: "/english" });
  });
});

describe("route groups", () => {
  it("protects app pages and their sub-pages", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/subjects/123")).toBe(true);
    expect(isProtectedPath("/settings")).toBe(true);
  });

  it("does not protect public pages or look-alikes", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/privacy")).toBe(false);
    expect(isProtectedPath("/dashboards-are-cool")).toBe(false);
  });

  it("knows which pages are for signed-out visitors only", () => {
    expect(isGuestOnlyPath("/login")).toBe(true);
    expect(isGuestOnlyPath("/signup")).toBe(true);
    expect(isGuestOnlyPath("/signup/check-email")).toBe(true);
    expect(isGuestOnlyPath("/reset-password")).toBe(false);
  });
});
