import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getCronSecret, getPublicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Called once a day by Vercel Cron (see vercel.json) so the free Supabase
 * project doesn't pause after 7 days without activity. Runs one tiny query.
 * Vercel sends "Authorization: Bearer <CRON_SECRET>".
 */
export async function GET(request: NextRequest) {
  const secret = getCronSecret();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const env = getPublicEnv();
  const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.rpc("health_check");
  if (error || data !== true) {
    console.error("keep-alive failed", error?.code);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
