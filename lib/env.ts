import { z } from "zod";

/**
 * Environment variables, validated when first used (not at import) so that
 * `next build` works without a full set of variables.
 *
 * NEXT_PUBLIC_* variables are inlined into the browser bundle at build time and
 * must be referenced literally (process.env.NEXT_PUBLIC_X) for that to work.
 */

const publicSchema = z.object({
  supabaseUrl: z.url(),
  supabasePublishableKey: z.string().min(1),
  turnstileSiteKey: z.string().min(1).optional(),
  siteUrl: z.url().optional(),
});

export type PublicEnv = z.infer<typeof publicSchema>;

function emptyToUndefined(value: string | undefined) {
  return value && value.trim() !== "" ? value.trim() : undefined;
}

export function getPublicEnv(): PublicEnv {
  const parsed = publicSchema.safeParse({
    supabaseUrl: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabasePublishableKey: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    turnstileSiteKey: emptyToUndefined(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
    siteUrl: emptyToUndefined(process.env.NEXT_PUBLIC_SITE_URL),
  });
  if (!parsed.success) {
    const fields = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Missing or invalid public environment variables: ${fields}`);
  }
  return parsed.data;
}

export function isCaptchaEnabled(): boolean {
  return Boolean(emptyToUndefined(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY));
}

/** Server-only. Never import this from a client component. */
export function getCronSecret(): string | undefined {
  return emptyToUndefined(process.env.CRON_SECRET);
}

/** "production" only on the real production deployment, never on previews. */
export function isProductionDeployment(): boolean {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "production";
  return process.env.NODE_ENV === "production" && process.env.STUDY_ENV === "production";
}

/**
 * True only once Study is live on its real domain: the production deployment
 * with NEXT_PUBLIC_SITE_URL set. Before that (while the owner tests on a
 * *.vercel.app address) pages are not indexed and the design system page
 * stays available.
 */
export function isPubliclyLaunched(): boolean {
  return isProductionDeployment() && Boolean(emptyToUndefined(process.env.NEXT_PUBLIC_SITE_URL));
}
