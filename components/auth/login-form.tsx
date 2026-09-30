"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TextField } from "@/components/ui/field";
import { Link } from "@/i18n/navigation";
import { signIn, type FormState } from "@/lib/auth/actions";
import { Captcha, FormError, SubmitButton, useFieldError, type CaptchaConfig } from "./form-parts";

const initialState: FormState = { status: "idle" };

export function LoginForm({ next, captcha }: { next?: string; captcha: CaptchaConfig }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const fieldError = useFieldError();
  const [state, action] = useActionState(signIn, initialState);

  return (
    <form action={action} noValidate className="grid gap-5">
      <input type="hidden" name="locale" value={locale} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <TextField
        id="login-email"
        name="email"
        type="email"
        label={t("email")}
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.email}
        error={fieldError(state.fieldErrors?.email)}
      />
      <div className="grid gap-2">
        <TextField
          id="login-password"
          name="password"
          type="password"
          label={t("password")}
          autoComplete="current-password"
          required
          error={fieldError(state.fieldErrors?.password)}
        />
        <Link
          href="/forgot-password"
          className="justify-self-start text-sm text-navy-700 underline-offset-4 hover:underline"
        >
          {t("login.forgot")}
        </Link>
      </div>
      <Captcha config={captcha} locale={locale} resetKey={state} />
      <FormError error={state.error} />
      <SubmitButton>{t("login.submit")}</SubmitButton>
    </form>
  );
}
