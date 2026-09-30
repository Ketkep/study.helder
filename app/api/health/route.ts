import { NextResponse } from "next/server";
import { adviceFor, checkSupabase, inspectKey, inspectSupabaseUrl } from "@/lib/diagnostics";
import { getCronSecret, isPubliclyLaunched } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Configuration self-check for the owner while setting up: open
 * /api/health in the browser to see which setting (if any) is wrong.
 * Never shows a key. Switched off once Study is publicly launched.
 */
export async function GET() {
  if (isPubliclyLaunched()) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const url = inspectSupabaseUrl(rawUrl);
  const key = inspectKey(rawKey);
  const canCallSupabase = !url.problem || url.problem === "not_supabase_host";
  const remote =
    canCallSupabase && rawUrl && rawKey && key !== "missing"
      ? await checkSupabase(new URL(rawUrl.trim()).origin, rawKey.trim())
      : undefined;
  const cronSecretSet = Boolean(getCronSecret());
  const advice = adviceFor({ url, key, remote, cronSecretSet });

  return NextResponse.json(
    {
      status: advice.length === 0 ? "everything looks good" : "something needs fixing",
      advice,
      details: {
        supabaseHost: url.host ?? null,
        keyType: key,
        supabaseAuth: remote?.auth ?? "not checked",
        database: remote?.database ?? "not checked",
        cronSecret: cronSecretSet ? "set" : "missing",
        deployment: process.env.VERCEL_ENV ?? "local",
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
