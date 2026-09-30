import type { AuthErrorKey } from "./schemas";

/**
 * Maps a Supabase Auth error to a message key. Unknown errors become a
 * generic message; raw error text is never shown to the user.
 */
export function authErrorKey(error: { code?: string; status?: number } | null | undefined): AuthErrorKey {
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
    case "session_not_found":
    case "session_expired":
    case "refresh_token_not_found":
      return "sessionExpired";
  }
  if (error?.status === 429) return "rateLimited";
  return "generic";
}
