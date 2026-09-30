"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { requestPasswordReset, resendConfirmation, type FormState } from "@/lib/auth/actions";
import { Captcha, FormError, SubmitButton, useFieldError, type CaptchaConfig } from "./form-parts";

const initialState: FormState = { status: "idle" };

export function ForgotPasswordForm({ captcha }: { captcha: CaptchaConfig }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const fieldError = useFieldError();
  const [state, action] = useActionState(requestPasswordReset, initialState);

  if (state.status === "success") {
    return <Notice tone="success">{t("forgot.sent")}</Notice>;
  }

  return (
    <form action={action} noValidate className="grid gap-5">
      <input type="hidden" name="locale" value={locale} />
      <TextField
        id="forgot-email"
        name="email"
        type="email"
        label={t("email")}
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.email}
        error={fieldError(state.fieldErrors?.email)}
      />
      <Captcha config={captcha} locale={locale} resetKey={state} />
      <FormError error={state.error} />
      <SubmitButton>{t("forgot.submit")}</SubmitButton>
    </form>
  );
}

export function ResendConfirmationForm({ captcha }: { captcha: CaptchaConfig }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const fieldError = useFieldError();
  const [state, action, pending] = useActionState(resendConfirmation, initialState);

  return (
    <form action={action} noValidate className="grid gap-4">
      <input type="hidden" name="locale" value={locale} />
      <TextField
        id="resend-email"
        name="email"
        type="email"
        label={t("email")}
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.email}
        error={fieldError(state.fieldErrors?.email)}
      />
      <Captcha config={captcha} locale={locale} resetKey={state} />
      <FormError error={state.error} />
      {state.status === "success" ? <Notice tone="success">{t("checkEmail.resent")}</Notice> : null}
      <Button type="submit" variant="secondary" pending={pending} className="justify-self-start">
        {t("checkEmail.resend")}
      </Button>
    </form>
  );
}
