import { describe, expect, it } from "vitest";
import { buildCsp, createNonce } from "@/lib/security/csp";

function directives(csp: string): Map<string, string> {
  return new Map(
    csp.split(";").map((part) => {
      const [name, ...values] = part.trim().split(" ");
      return [name, values.join(" ")];
    }),
  );
}

describe("buildCsp", () => {
  const base = { nonce: "abc123", isDev: false, supabaseUrl: "https://xyz.supabase.co", captcha: false };

  it("only allows scripts with the nonce in production", () => {
    const d = directives(buildCsp(base));
    expect(d.get("script-src")).toBe("'self' 'nonce-abc123' 'strict-dynamic'");
    expect(d.get("script-src")).not.toContain("unsafe-eval");
    expect(d.get("script-src")).not.toContain("unsafe-inline");
  });

  it("blocks framing, plugins and foreign form targets", () => {
    const d = directives(buildCsp(base));
    expect(d.get("frame-ancestors")).toBe("'none'");
    expect(d.get("object-src")).toBe("'none'");
    expect(d.get("form-action")).toBe("'self'");
    expect(d.get("frame-src")).toBe("'none'");
    expect(d.has("upgrade-insecure-requests")).toBe(true);
  });

  it("allows Supabase for network requests", () => {
    expect(directives(buildCsp(base)).get("connect-src")).toBe("'self' https://xyz.supabase.co");
  });

  it("allows Cloudflare Turnstile only when CAPTCHA is on", () => {
    const d = directives(buildCsp({ ...base, captcha: true }));
    expect(d.get("frame-src")).toBe("https://challenges.cloudflare.com");
    expect(d.get("connect-src")).toContain("https://challenges.cloudflare.com");
  });

  it("relaxes only what the dev server needs in development", () => {
    const d = directives(buildCsp({ ...base, isDev: true }));
    expect(d.get("script-src")).toContain("'unsafe-eval'");
    expect(d.get("connect-src")).toContain("ws:");
    expect(d.has("upgrade-insecure-requests")).toBe(false);
  });
});

describe("createNonce", () => {
  it("is different every time", () => {
    const nonces = new Set(Array.from({ length: 50 }, () => createNonce()));
    expect(nonces.size).toBe(50);
  });
});
