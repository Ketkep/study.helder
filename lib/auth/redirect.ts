import { defaultLocale, isLocale, type Locale } from "@/i18n/routing";

/** Paths (without locale) that require a signed-in user. */
export const PROTECTED_PATHS = ["/dashboard", "/subjects", "/flashcards", "/progress", "/settings"];

/** Auth pages a signed-in user has no reason to see. */
export const GUEST_ONLY_PATHS = ["/login", "/signup"];

export function stripLocale(pathname: string): { locale: Locale | null; path: string } {
  const match = pathname.match(/^\/([a-z]{2})(?=\/|$)(.*)$/);
  if (match && isLocale(match[1])) {
    return { locale: match[1], path: match[2] === "" ? "/" : match[2] };
  }
  return { locale: null, path: pathname };
}

function startsWithSegment(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function isProtectedPath(path: string): boolean {
  return PROTECTED_PATHS.some((prefix) => startsWithSegment(path, prefix));
}

export function isGuestOnlyPath(path: string): boolean {
  return GUEST_ONLY_PATHS.some((prefix) => startsWithSegment(path, prefix));
}

/**
 * Returns a same-site path that is safe to redirect to after login, or the
 * dashboard. Rejects absolute URLs, protocol-relative URLs ("//evil.com"),
 * backslash tricks and anything outside our locales.
 */
export function safeNextPath(next: unknown, locale: Locale = defaultLocale): string {
  const fallback = `/${locale}/dashboard`;
  if (typeof next !== "string" || next.length === 0 || next.length > 512) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  if (/[\u0000-\u001f]/.test(next)) return fallback;

  let parsed: URL;
  try {
    parsed = new URL(next, "https://study.invalid");
  } catch {
    return fallback;
  }
  if (parsed.origin !== "https://study.invalid") return fallback;

  const { locale: pathLocale, path } = stripLocale(parsed.pathname);
  const targetLocale = pathLocale ?? locale;
  return `/${targetLocale}${path === "/" ? "" : path}${parsed.search}${parsed.hash}`;
}
