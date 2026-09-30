"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckboxField, TextField } from "@/components/ui/field";
import { Link } from "@/i18n/navigation";
import { signUp, type FormState } from "@/lib/auth/actions";
import { Captcha, FormError, SubmitButton, useFieldError, type CaptchaConfig } from "./form-parts";

const initialState: FormState = { status: "idle" };

export function SignupForm({ captcha }: { captcha: CaptchaConfig }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const fieldError = useFieldError();
  const [state, action] = useActionState(signUp, initialState);
  const linkClass = "text-navy-700 underline underline-offset-4";

  return (
    <form action={action} noValidate className="grid gap-5">
      <input type="hidden" name="locale" value={locale} />
      <TextField
        id="signup-email"
        name="email"
        type="email"
        label={t("email")}
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.email}
        error={fieldError(state.fieldErrors?.email)}
      />
      <TextField
        id="signup-password"
        name="password"
        type="password"
        label={t("password")}
        hint={t("passwordHint")}
        autoComplete="new-password"
        minLength={8}
        required
        error={fieldError(state.fieldErrors?.password)}
      />
      <CheckboxField
        id="signup-age"
        name="age"
        label={t("signup.age")}
        defaultChecked={state.age}
        required
        error={fieldError(state.fieldErrors?.age)}
      />
      <Captcha config={captcha} locale={locale} resetKey={state} />
      <FormError error={state.error} />
      <SubmitButton>{t("signup.submit")}</SubmitButton>
      <p className="text-sm text-ink-muted">
        {t.rich("signup.legal", {
          terms: (chunks) => (
            <Link href="/terms" className={linkClass}>
              {chunks}
            </Link>
          ),
          privacy: (chunks) => (
            <Link href="/privacy" className={linkClass}>
              {chunks}
            </Link>
          ),
        })}
      </p>
    </form>
  );
}
