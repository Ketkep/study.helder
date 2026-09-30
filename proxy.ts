import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { isGuestOnlyPath, isProtectedPath, stripLocale } from "@/lib/auth/redirect";
import { getPublicEnv, isCaptchaEnabled } from "@/lib/env";
import { buildCsp, createNonce } from "@/lib/security/csp";
import { refreshSession } from "@/lib/supabase/proxy";

const handleI18n = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const env = getPublicEnv();

  // 1. Refresh the login session first, so the page sees fresh tokens.
  const session = await refreshSession(request);

  // 2. Per-request nonce for the Content-Security-Policy.
  const nonce = createNonce();
  const csp = buildCsp({
    nonce,
    isDev: process.env.NODE_ENV === "development",
    supabaseUrl: env.supabaseUrl,
    captcha: isCaptchaEnabled(),
  });
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("content-security-policy", csp);
  const forwarded = new NextRequest(request, { headers });

  // 3. Language routing: "/" and unprefixed paths redirect to /nl or /en.
  let response = handleI18n(forwarded);

  // 4. Optimistic auth redirects. Pages check the user again server-side.
  const isRedirect = response.headers.has("location");
  const { locale, path } = stripLocale(request.nextUrl.pathname);
  if (!isRedirect && locale) {
    if (isProtectedPath(path) && !session.signedIn) {
      const login = new URL(`/${locale}/login`, request.url);
      login.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
      response = NextResponse.redirect(login);
    } else if (isGuestOnlyPath(path) && session.signedIn) {
      response = NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  session.applyTo(response);
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Everything except API routes, the auth callback, Next internals and files.
  matcher: ["/((?!api/|auth/|_next/|_vercel/|.*\\..*).*)"],
};
