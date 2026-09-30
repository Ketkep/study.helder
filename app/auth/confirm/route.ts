import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES: EmailOtpType[] = ["email", "signup", "recovery", "email_change"];

/**
 * Target of the links in auth emails (confirm account, reset password).
 * Verifies the one-time token, which signs the user in, then sends them on
 * in their own language. Uses token_hash so the link also works when opened
 * in a different browser than the one used to sign up.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const fallbackLocale = pickLocale(request.headers.get("accept-language"));

  if (!tokenHash || !type || !ALLOWED_TYPES.includes(type)) {
    return redirectTo(request, `/${fallbackLocale}/auth-error`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error || !data.user) {
    return redirectTo(request, `/${fallbackLocale}/auth-error`);
  }

  const metadataLocale = data.user.user_metadata?.locale;
  const locale: Locale = isLocale(metadataLocale) ? metadataLocale : fallbackLocale;
  return redirectTo(request, type === "recovery" ? `/${locale}/reset-password` : `/${locale}/dashboard`);
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

function pickLocale(acceptLanguage: string | null): Locale {
  const first = acceptLanguage?.split(",")[0]?.trim().slice(0, 2).toLowerCase();
  return isLocale(first) ? first : defaultLocale;
}
