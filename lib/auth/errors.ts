import type { AuthErrorKey } from "./schemas";

type AuthErrorLike = { code?: string; status?: number; name?: string; message?: string } | null | undefined;

/**
 * Maps a Supabase Auth error to a message key. Unknown errors become a
 * generic message; raw error text is never shown to the user.
 */
export function authErrorKey(error: AuthErrorLike): AuthErrorKey {
  switch (error?.code) {
    case "invalid_credentials":
      return "invalidCredentials";
    case "email_not_confirmed":
      return "emailNotConfirmed";
    case "captcha_failed":
      return "captchaFailed";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "rateLimited";
    case "weak_password":
      return "passwordWeak";
    case "same_password":
      return "samePassword";
    case "email_address_invalid":
      return "emailInvalid";
    // Supabase's built-in email only sends to members of the project's team.
    case "email_address_not_authorized":
      return "emailNotAuthorized";
    case "signup_disabled":
    case "email_provider_disabled":
      return "signupDisabled";
    case "session_not_found":
    case "session_expired":
    case "refresh_token_not_found":
      return "sessionExpired";
  }
  if (error?.status === 429) return "rateLimited";
  // Supabase unreachable (network, wrong URL) or refusing our key (401/403 without a code).
  if (error?.name === "AuthRetryableFetchError" || error?.status === 0) return "serviceUnavailable";
  if (!error?.code && (error?.status === 401 || error?.status === 403 || (error?.status ?? 0) >= 500)) {
    return "serviceUnavailable";
  }
  return "generic";
}

/**
 * Writes an auth failure to the server log (Vercel > Logs) so problems can be
 * diagnosed. Email addresses are removed from the message.
 */
export function logAuthError(action: string, error: AuthErrorLike): void {
  if (!error) return;
  const message = error.message?.replace(/[^\s"'<>@]+@[^\s"'<>@]+/g, "[email]").slice(0, 200);
  console.error(
    `[auth] ${action} failed`,
    JSON.stringify({ code: error.code, status: error.status, name: error.name, message }),
  );
}
