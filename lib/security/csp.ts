export type CspOptions = {
  nonce: string;
  isDev: boolean;
  supabaseUrl?: string;
  captcha: boolean;
};

const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";

/**
 * Builds the Content-Security-Policy header. Scripts only run with the
 * per-request nonce ('strict-dynamic' lets those scripts load their own
 * dependencies, which Turnstile needs).
 */
export function buildCsp({ nonce, isDev, supabaseUrl, captcha }: CspOptions): string {
  const connect = ["'self'"];
  if (supabaseUrl) connect.push(supabaseUrl);
  if (captcha) connect.push(TURNSTILE_ORIGIN);
  if (isDev) connect.push("ws:");

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(isDev ? ["'unsafe-eval'"] : [])],
    // Inline style attributes are low risk and used by React for dynamic widths.
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'"],
    "connect-src": connect,
    "frame-src": captcha ? [TURNSTILE_ORIGIN] : ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  const parts = Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`);
  if (!isDev) parts.push("upgrade-insecure-requests");
  return parts.join("; ");
}

export function createNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}
