/**
 * Configuration self-check behind /api/health. Tells the owner in plain words
 * which setting is wrong, without revealing any key.
 */

export type UrlProblem = "missing" | "invalid" | "not_https" | "dashboard_url" | "has_path" | "not_supabase_host";
export type KeyKind = "missing" | "publishable" | "secret" | "legacy_jwt" | "unknown";
export type RemoteResult = "ok" | "unreachable" | "key_rejected" | "function_missing" | `http_${number}`;

export function inspectSupabaseUrl(raw: string | undefined): { host?: string; problem?: UrlProblem } {
  const value = raw?.trim();
  if (!value) return { problem: "missing" };
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { problem: "invalid" };
  }
  if (url.hostname === "supabase.com" || url.hostname.endsWith(".supabase.com")) {
    return { host: url.hostname, problem: "dashboard_url" };
  }
  const isLocal = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  if (url.protocol !== "https:" && !isLocal) return { host: url.hostname, problem: "not_https" };
  if (url.pathname !== "/" && url.pathname !== "") return { host: url.hostname, problem: "has_path" };
  if (!isLocal && !url.hostname.endsWith(".supabase.co")) return { host: url.hostname, problem: "not_supabase_host" };
  return { host: url.hostname };
}

export function inspectKey(raw: string | undefined): KeyKind {
  const value = raw?.trim();
  if (!value) return "missing";
  if (value.startsWith("sb_publishable_")) return "publishable";
  if (value.startsWith("sb_secret_")) return "secret";
  // Legacy anon keys are JWTs; they still work.
  if (/^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(value)) return "legacy_jwt";
  return "unknown";
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

/** Asks Supabase Auth and the database whether they accept our URL and key. */
export async function checkSupabase(
  origin: string,
  key: string,
  fetchImpl: FetchLike = fetch,
): Promise<{ auth: RemoteResult; database: RemoteResult }> {
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const call = async (path: string, init: RequestInit): Promise<RemoteResult> => {
    try {
      const response = await fetchImpl(`${origin}${path}`, {
        ...init,
        headers: { ...headers, ...(init.headers ?? {}) },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) return "ok";
      if (response.status === 401 || response.status === 403) return "key_rejected";
      if (response.status === 404 && path.includes("/rpc/")) return "function_missing";
      return `http_${response.status}`;
    } catch {
      return "unreachable";
    }
  };

  const [auth, database] = await Promise.all([
    call("/auth/v1/settings", { method: "GET" }),
    call("/rest/v1/rpc/health_check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }),
  ]);
  return { auth, database };
}

/** Plain-language advice for the owner, one line per problem found. */
export function adviceFor(input: {
  url: ReturnType<typeof inspectSupabaseUrl>;
  key: KeyKind;
  remote?: { auth: RemoteResult; database: RemoteResult };
  cronSecretSet: boolean;
}): string[] {
  const advice: string[] = [];
  const setting = "Fix it in Vercel > Environment Variables, then Deployments > ... > Redeploy.";

  switch (input.url.problem) {
    case "missing":
      advice.push(`NEXT_PUBLIC_SUPABASE_URL is empty. ${setting}`);
      break;
    case "invalid":
      advice.push(
        `NEXT_PUBLIC_SUPABASE_URL is not a web address. It should look like https://abcd.supabase.co. ${setting}`,
      );
      break;
    case "dashboard_url":
      advice.push(
        `NEXT_PUBLIC_SUPABASE_URL is the address of the Supabase dashboard, not of your project. Use the Project URL from Supabase > Project Settings > Data API (https://abcd.supabase.co). ${setting}`,
      );
      break;
    case "not_https":
      advice.push(`NEXT_PUBLIC_SUPABASE_URL must start with https://. ${setting}`);
      break;
    case "has_path":
      advice.push(
        `NEXT_PUBLIC_SUPABASE_URL has extra text after the domain. Remove everything after .supabase.co. ${setting}`,
      );
      break;
    case "not_supabase_host":
      advice.push(`NEXT_PUBLIC_SUPABASE_URL should end in .supabase.co. ${setting}`);
      break;
  }

  switch (input.key) {
    case "missing":
      advice.push(`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is empty. ${setting}`);
      break;
    case "secret":
      advice.push(
        `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY contains the SECRET key. Replace it with the Publishable key (starts with sb_publishable_), and treat the secret key as leaked: rotate it in Supabase > Project Settings > API Keys. ${setting}`,
      );
      break;
    case "unknown":
      advice.push(
        `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY doesn't look like a Supabase key. Copy the Publishable key (starts with sb_publishable_) from Supabase > Project Settings > API Keys. ${setting}`,
      );
      break;
  }

  if (input.remote) {
    const { auth, database } = input.remote;
    if (auth === "unreachable") {
      advice.push(
        "Supabase can't be reached at this URL. Check NEXT_PUBLIC_SUPABASE_URL for typos, and check in the Supabase dashboard that the project isn't paused.",
      );
    } else if (auth === "key_rejected" || database === "key_rejected") {
      advice.push(
        `Supabase rejects the key. Copy the Publishable key again from Supabase > Project Settings > API Keys, from the same project as the URL. ${setting}`,
      );
    } else if (auth !== "ok") {
      advice.push(`Supabase Auth answered with an unexpected ${auth.replace("http_", "HTTP ")}.`);
    }
    if (auth === "ok" && database === "function_missing") {
      advice.push(
        "The database is reachable but the keep-alive function is missing. Run the SQL from docs/SETUP.md step 1.4 in the Supabase SQL Editor.",
      );
    } else if (auth === "ok" && database !== "ok" && database !== "key_rejected") {
      advice.push(`The database answered with an unexpected ${database.replace("http_", "HTTP ")}.`);
    }
  }

  if (!input.cronSecretSet) {
    advice.push(`CRON_SECRET is empty, so the daily keep-alive can't run. ${setting}`);
  }
  return advice;
}
