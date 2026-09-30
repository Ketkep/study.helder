import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Cheap check for UI decisions (e.g. "Log in" vs "Go to Study" in the site
 * header). Verifies the JWT but never use it to authorize data access; use
 * getCurrentUser() or RLS for that.
 */
export async function hasSession(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    return !error && Boolean(data?.claims?.sub);
  } catch {
    return false;
  }
}
