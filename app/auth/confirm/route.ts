import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES: EmailOtpType[] = ["email", "signup", "recovery", "email_change"];

/**
 * Target of the links in auth emails (confirm account, reset password).
 * Signs the user in, then sends them on in their own language.
 *
 * Handles both link formats:
 * - `?code=...`: Supabase's default email templates. The link first goes to
 *   Supabase, which confirms the address and redirects here with a one-time
 *   code. The code only works in the browser that started sign-up or reset.
 * - `?token_hash=...&type=...`: our own templates (supabase/templates), used
 *   once a custom email sender is set up. Works in any browser.
 *
 * `next=reset-password` is added by the forgot-password form so a recovery
 * link lands on the new-password page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const fallbackLocale = pickLocale(request.headers.get("accept-language"));
  const isRecovery = searchParams.get("next") === "reset-password" || searchParams.get("type") === "recovery";

  // Supabase redirects here with an error when a link is expired or already used.
  if (searchParams.has("error") || searchParams.has("error_code")) {
    return redirectTo(request, `/${fallbackLocale}/auth-error`);
  }

  const supabase = await createClient();
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      // Supabase only hands out a code after it has confirmed the address, so
      // a sign-up link opened in another browser still confirmed the account:
      // the user just needs to log in. A reset link must be requested again.
      return redirectTo(
        request,
        isRecovery ? `/${fallbackLocale}/auth-error` : `/${fallbackLocale}/login?notice=email-confirmed`,
      );
    }
    return redirectTo(request, destination(data.user.user_metadata, fallbackLocale, isRecovery));
  }

  if (tokenHash && type && ALLOWED_TYPES.includes(type)) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error || !data.user) {
      return redirectTo(request, `/${fallbackLocale}/auth-error`);
    }
    return redirectTo(request, destination(data.user.user_metadata, fallbackLocale, isRecovery));
  }

  return redirectTo(request, `/${fallbackLocale}/auth-error`);
}

function destination(metadata: Record<string, unknown> | undefined, fallback: Locale, isRecovery: boolean) {
  const locale = isLocale(metadata?.locale) ? metadata.locale : fallback;
  return isRecovery ? `/${locale}/reset-password` : `/${locale}/dashboard`;
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

function pickLocale(acceptLanguage: string | null): Locale {
  const first = acceptLanguage?.split(",")[0]?.trim().slice(0, 2).toLowerCase();
  return isLocale(first) ? first : defaultLocale;
}
