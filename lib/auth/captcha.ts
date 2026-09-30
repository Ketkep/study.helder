import "server-only";
import { headers } from "next/headers";
import type { CaptchaConfig } from "@/components/auth/form-parts";

/** Turnstile settings for auth forms, or null when CAPTCHA is off. */
export async function getCaptchaConfig(): Promise<CaptchaConfig> {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  if (!siteKey) return null;
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return { siteKey, nonce };
}
