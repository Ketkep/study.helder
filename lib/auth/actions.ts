"use server";

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { defaultLocale, isLocale, type Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { authErrorKey, logAuthError } from "./errors";
import { getRequestOrigin } from "./origin";
import { safeNextPath } from "./redirect";
import {
  changePasswordSchema,
  emailOnlySchema,
  fieldErrorsFrom,
  newPasswordSchema,
  signInSchema,
  signUpSchema,
  type AuthErrorKey,
  type FieldName,
} from "./schemas";

export type FormState = {
  status: "idle" | "error" | "success";
  error?: AuthErrorKey;
  fieldErrors?: Partial<Record<FieldName, AuthErrorKey>>;
  /** Re-fills the email field after an error. Never the password. */
  email?: string;
  /** Keeps the age checkbox ticked after an error. */
  age?: boolean;
};

function str(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

async function formLocale(formData: FormData): Promise<Locale> {
  const fromForm = str(formData, "locale");
  if (isLocale(fromForm)) return fromForm;
  const current = await getLocale();
  return isLocale(current) ? current : defaultLocale;
}

/** Turnstile adds this hidden field to the form when CAPTCHA is on. */
function captchaToken(formData: FormData): string | undefined {
  return str(formData, "cf-turnstile-response") || undefined;
}

// Errors caused by what the user typed. Everything else goes to the server log.
const EXPECTED_ERRORS = new Set<AuthErrorKey>([
  "invalidCredentials",
  "emailNotConfirmed",
  "passwordWeak",
  "samePassword",
  "emailInvalid",
]);

/** Message key for a Supabase error, logging the ones worth looking into. */
function failure(action: string, error: Parameters<typeof authErrorKey>[0]): AuthErrorKey {
  const key = authErrorKey(error);
  if (!EXPECTED_ERRORS.has(key)) logAuthError(action, error);
  return key;
}

// Errors worth showing on forms that otherwise always report success
// (they reveal nothing about whether an account exists).
const SHOWN_ON_EMAIL_FORMS = new Set<AuthErrorKey>([
  "rateLimited",
  "captchaFailed",
  "emailNotAuthorized",
  "serviceUnavailable",
]);

function userLocale(metadata: Record<string, unknown> | undefined, fallback: Locale): Locale {
  const value = metadata?.locale;
  return isLocale(value) ? value : fallback;
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const locale = await formLocale(formData);
  const parsed = signUpSchema.safeParse({
    email: str(formData, "email"),
    password: str(formData, "password"),
    age: str(formData, "age"),
  });
  const age = str(formData, "age") === "on";
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFrom(parsed.error), email: str(formData, "email"), age };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${await getRequestOrigin()}/auth/confirm`,
      captchaToken: captchaToken(formData),
      // Age: only the fact that it was confirmed, and when (data minimisation).
      data: { locale, age_confirmed_at: new Date().toISOString() },
    },
  });

  if (error) {
    const key = failure("signUp", error);
    return {
      status: "error",
      ...(key === "passwordWeak" ? { fieldErrors: { password: key } } : { error: key }),
      email: parsed.data.email,
      age,
    };
  }

  // Same response whether or not the address already has an account, so the
  // form cannot be used to find out who is registered.
  redirect(`/${locale}/signup/check-email`);
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const locale = await formLocale(formData);
  const parsed = signInSchema.safeParse({
    email: str(formData, "email"),
    password: str(formData, "password"),
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFrom(parsed.error), email: str(formData, "email") };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { captchaToken: captchaToken(formData) },
  });

  if (error || !data.user) {
    return { status: "error", error: failure("signIn", error), email: parsed.data.email };
  }

  const preferred = userLocale(data.user.user_metadata, locale);
  const next = str(formData, "next");
  redirect(next ? safeNextPath(next, preferred) : `/${preferred}/dashboard`);
}

export async function signOut(formData?: FormData): Promise<void> {
  const locale = formData ? await formLocale(formData) : await getLocale();
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${isLocale(locale) ? locale : defaultLocale}`);
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = emailOnlySchema.safeParse({ email: str(formData, "email") });
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFrom(parsed.error), email: str(formData, "email") };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    // Lets /auth/confirm send the user to the new-password page.
    redirectTo: `${await getRequestOrigin()}/auth/confirm?next=reset-password`,
    captchaToken: captchaToken(formData),
  });

  // Only show errors the user can act on; otherwise always report success so
  // this form doesn't reveal which addresses have an account.
  const key = error ? failure("requestPasswordReset", error) : null;
  if (key && SHOWN_ON_EMAIL_FORMS.has(key)) {
    return { status: "error", error: key, email: parsed.data.email };
  }
  return { status: "success" };
}

export async function resendConfirmation(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = emailOnlySchema.safeParse({ email: str(formData, "email") });
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFrom(parsed.error), email: str(formData, "email") };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${await getRequestOrigin()}/auth/confirm`,
      captchaToken: captchaToken(formData),
    },
  });

  const key = error ? failure("resendConfirmation", error) : null;
  if (key && SHOWN_ON_EMAIL_FORMS.has(key)) {
    return { status: "error", error: key, email: parsed.data.email };
  }
  return { status: "success" };
}

/**
 * Sets a new password for the signed-in user.
 * - from=reset: after a reset link. Redirects to the dashboard.
 * - from=settings: asks for the current password first, so someone with
 *   access to an unlocked device can't lock the owner out. Stays on the page.
 */
export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const locale = await formLocale(formData);
  const fromSettings = str(formData, "from") !== "reset";
  const parsed = newPasswordSchema.safeParse({ password: str(formData, "password") });
  const current = fromSettings
    ? changePasswordSchema.pick({ currentPassword: true }).safeParse({
        currentPassword: str(formData, "currentPassword"),
      })
    : null;
  if (!parsed.success || (current && !current.success)) {
    return {
      status: "error",
      fieldErrors: {
        ...(current && !current.success ? fieldErrorsFrom(current.error) : {}),
        ...(!parsed.success ? fieldErrorsFrom(parsed.error) : {}),
      },
    };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user?.email) {
    return { status: "error", error: "sessionExpired" };
  }

  if (current?.success) {
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: current.data.currentPassword,
    });
    if (verifyError) {
      const key = failure("verifyCurrentPassword", verifyError);
      return key === "invalidCredentials"
        ? { status: "error", fieldErrors: { currentPassword: "currentPasswordWrong" } }
        : { status: "error", error: key };
    }
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    const key = failure("updatePassword", error);
    return key === "passwordWeak" || key === "samePassword"
      ? { status: "error", fieldErrors: { password: key } }
      : { status: "error", error: key };
  }

  if (!fromSettings) {
    redirect(`/${locale}/dashboard?notice=password-updated`);
  }
  return { status: "success" };
}

export async function updateLanguage(formData: FormData): Promise<void> {
  const requested = str(formData, "language");
  const current = await formLocale(formData);
  if (!isLocale(requested)) redirect(`/${current}/settings`);

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/${current}/login`);

  const { error } = await supabase.auth.updateUser({ data: { locale: requested } });
  if (error) logAuthError("updateLanguage", error);
  redirect(`/${requested}/settings?notice=${error ? "language-error" : "language-saved"}`);
}
