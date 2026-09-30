"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { updatePassword, type FormState } from "@/lib/auth/actions";
import { FormError, SubmitButton, useFieldError } from "./form-parts";

const initialState: FormState = { status: "idle" };

/**
 * New password for the signed-in user. `from="reset"` (after a reset link)
 * sends the user to the dashboard; `from="settings"` stays on the page.
 */
export function NewPasswordForm({ from }: { from: "reset" | "settings" }) {
  const t = useTranslations();
  const locale = useLocale();
  const fieldError = useFieldError();
  const [state, action, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={action} noValidate className="grid max-w-md gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="from" value={from} />
      {from === "settings" ? (
        <TextField
          id="settings-current-password"
          name="currentPassword"
          type="password"
          label={t("auth.currentPassword")}
          autoComplete="current-password"
          required
          error={fieldError(state.fieldErrors?.currentPassword)}
        />
      ) : null}
      <TextField
        id={`${from}-new-password`}
        name="password"
        type="password"
        label={t("auth.newPassword")}
        hint={t("auth.passwordHint")}
        autoComplete="new-password"
        minLength={8}
        required
        error={fieldError(state.fieldErrors?.password)}
      />
      <FormError error={state.error} />
      {state.status === "success" ? <Notice tone="success">{t("app.settings.password.saved")}</Notice> : null}
      {from === "reset" ? (
        <SubmitButton>{t("auth.reset.submit")}</SubmitButton>
      ) : (
        <Button type="submit" variant="secondary" pending={pending} className="justify-self-start">
          {t("app.settings.password.submit")}
        </Button>
      )}
    </form>
  );
}
