"use client";

import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import type { AuthErrorKey } from "@/lib/auth/schemas";
import { Turnstile } from "./turnstile";

export type CaptchaConfig = { siteKey: string; nonce?: string } | null;

export function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" pending={pending} className="w-full">
      {children}
    </Button>
  );
}

export function FormError({ error }: { error?: AuthErrorKey }) {
  const t = useTranslations("auth.errors");
  if (!error) return null;
  return <Notice tone="error">{t(error)}</Notice>;
}

/** Translates a field error key, or returns undefined. */
export function useFieldError() {
  const t = useTranslations("auth.errors");
  return (key?: AuthErrorKey) => (key ? t(key) : undefined);
}

export function Captcha({ config, locale, resetKey }: { config: CaptchaConfig; locale: string; resetKey?: unknown }) {
  const t = useTranslations("auth");
  if (!config) return null;
  return (
    <Turnstile
      siteKey={config.siteKey}
      nonce={config.nonce}
      locale={locale}
      resetKey={resetKey}
      label={t("captchaLabel")}
    />
  );
}
