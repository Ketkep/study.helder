import { describe, expect, it } from "vitest";
import { adviceFor, checkSupabase, inspectKey, inspectSupabaseUrl } from "@/lib/diagnostics";

describe("inspectSupabaseUrl", () => {
  it("accepts a project URL", () => {
    expect(inspectSupabaseUrl("https://abcd.supabase.co")).toEqual({ host: "abcd.supabase.co" });
    expect(inspectSupabaseUrl(" https://abcd.supabase.co/ ")).toEqual({ host: "abcd.supabase.co" });
    expect(inspectSupabaseUrl("http://127.0.0.1:54321")).toEqual({ host: "127.0.0.1" });
  });

  it.each([
    [undefined, "missing"],
    ["", "missing"],
    ["abcd.supabase.co", "invalid"],
    ["https://supabase.com/dashboard/project/abcd", "dashboard_url"],
    ["http://abcd.supabase.co", "not_https"],
    ["https://abcd.supabase.co/rest/v1/", "has_path"],
    ["https://example.com", "not_supabase_host"],
  ])("flags %j as %s", (input, problem) => {
    expect(inspectSupabaseUrl(input).problem).toBe(problem);
  });
});

describe("inspectKey", () => {
  it.each([
    [undefined, "missing"],
    ["sb_publishable_abc123", "publishable"],
    [" sb_publishable_abc123 ", "publishable"],
    ["sb_secret_abc123", "secret"],
    ["eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiJ9.c2ln", "legacy_jwt"],
    ["hello", "unknown"],
  ])("recognises %j as %s", (input, kind) => {
    expect(inspectKey(input)).toBe(kind);
  });
});

describe("checkSupabase", () => {
  const respond = (authStatus: number, dbStatus: number) => async (input: string) =>
    new Response("{}", { status: input.includes("/rpc/") ? dbStatus : authStatus });

  it("reports ok when both answer", async () => {
    expect(await checkSupabase("https://a.supabase.co", "k", respond(200, 200))).toEqual({
      auth: "ok",
      database: "ok",
    });
  });

  it("recognises a rejected key and a missing function", async () => {
    expect(await checkSupabase("https://a.supabase.co", "k", respond(401, 401))).toEqual({
      auth: "key_rejected",
      database: "key_rejected",
    });
    expect((await checkSupabase("https://a.supabase.co", "k", respond(200, 404))).database).toBe("function_missing");
  });

  it("recognises an unreachable host", async () => {
    const failing = async () => {
      throw new TypeError("fetch failed");
    };
    expect(await checkSupabase("https://a.supabase.co", "k", failing)).toEqual({
      auth: "unreachable",
      database: "unreachable",
    });
  });
});

describe("adviceFor", () => {
  const good = { url: { host: "a.supabase.co" }, key: "publishable" as const, cronSecretSet: true };

  it("says nothing when everything is fine", () => {
    expect(adviceFor({ ...good, remote: { auth: "ok", database: "ok" } })).toEqual([]);
  });

  it("points at the key when Supabase rejects it", () => {
    const advice = adviceFor({ ...good, remote: { auth: "key_rejected", database: "key_rejected" } });
    expect(advice).toHaveLength(1);
    expect(advice[0]).toContain("rejects the key");
  });

  it("warns loudly about a secret key in the public variable", () => {
    expect(adviceFor({ ...good, key: "secret" })[0]).toContain("SECRET key");
  });

  it("explains a dashboard URL", () => {
    expect(adviceFor({ ...good, url: { problem: "dashboard_url" } })[0]).toContain("Project URL");
  });
});
