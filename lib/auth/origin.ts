import "server-only";
import { headers } from "next/headers";

/**
 * Base URL for links in auth emails. Uses NEXT_PUBLIC_SITE_URL when set
 * (production), otherwise the host of the current request (previews, local).
 * Supabase only accepts redirect URLs on its allow list, so a spoofed Host
 * header cannot send email links elsewhere.
 */
export async function getRequestOrigin(): Promise<string> {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return new URL(explicit).origin;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}
