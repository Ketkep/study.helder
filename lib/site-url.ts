/**
 * The public base URL of this deployment, used for metadata and links in
 * emails. Prefers NEXT_PUBLIC_SITE_URL, then Vercel's deployment URL.
 */
export function getSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return new URL(explicit);
  const vercel = process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL;
  if (vercel) return new URL(`https://${vercel}`);
  return new URL("http://localhost:3000");
}
