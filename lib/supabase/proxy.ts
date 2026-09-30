import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { getPublicEnv } from "@/lib/env";

type CookieToSet = { name: string; value: string; options: Record<string, unknown> };

export type SessionRefresh = {
  signedIn: boolean;
  /** Write refreshed auth cookies (and cache headers) onto the outgoing response. */
  applyTo: (response: NextResponse) => NextResponse;
};

/**
 * Refreshes the Supabase session (if any) before the page renders.
 *
 * Refreshed cookies are written into `request.cookies` right away, so the
 * page rendered for this request already sees the new tokens. Call `applyTo`
 * on the final response to send them to the browser.
 *
 * `signedIn` is only an optimistic check for redirects. Pages verify the
 * user again with the Auth server.
 */
export async function refreshSession(request: NextRequest): Promise<SessionRefresh> {
  const env = getPublicEnv();
  const cookiesToSet: CookieToSet[] = [];
  let extraHeaders: Record<string, string> = {};

  const supabase = createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies, headers) {
        cookies.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          cookiesToSet.push({ name, value, options: options as Record<string, unknown> });
        });
        extraHeaders = { ...extraHeaders, ...(headers ?? {}) };
      },
    },
  });

  // getClaims() verifies the JWT and refreshes it when it has expired.
  const { data, error } = await supabase.auth.getClaims();
  const signedIn = !error && Boolean(data?.claims?.sub);

  return {
    signedIn,
    applyTo(response) {
      cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      Object.entries(extraHeaders).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    },
  };
}
