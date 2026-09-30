import { describe, expect, it } from "vitest";
import { authErrorKey } from "@/lib/auth/errors";
import { fieldErrorsFrom, signInSchema, signUpSchema } from "@/lib/auth/schemas";

describe("signUpSchema", () => {
  const valid = { email: "  Sanne@Example.com ", password: "correct horse", age: "on" };

  it("accepts a valid sign-up and normalises the email", () => {
    const result = signUpSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("sanne@example.com");
  });

  it("requires the age confirmation", () => {
    const result = signUpSchema.safeParse({ ...valid, age: undefined });
    expect(result.success).toBe(false);
    expect(fieldErrorsFrom(result.error!)).toEqual({ age: "ageRequired" });
  });

  it("rejects short and overly long passwords", () => {
    const short = signUpSchema.safeParse({ ...valid, password: "1234567" });
    expect(fieldErrorsFrom(short.error!).password).toBe("passwordTooShort");

    // 72 bytes is the bcrypt limit; multi-byte characters count as more than one.
    const long = signUpSchema.safeParse({ ...valid, password: "é".repeat(37) });
    expect(fieldErrorsFrom(long.error!).password).toBe("passwordTooLong");
  });

  it("rejects invalid email addresses", () => {
    const result = signUpSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(fieldErrorsFrom(result.error!).email).toBe("emailInvalid");
  });

  it("reports every invalid field at once", () => {
    const result = signUpSchema.safeParse({});
    expect(Object.keys(fieldErrorsFrom(result.error!)).sort()).toEqual(["age", "email", "password"]);
  });
});

describe("signInSchema", () => {
  it("does not apply the new-password rules to existing passwords", () => {
    expect(signInSchema.safeParse({ email: "a@b.nl", password: "short" }).success).toBe(true);
  });

  it("requires a password", () => {
    const result = signInSchema.safeParse({ email: "a@b.nl", password: "" });
    expect(fieldErrorsFrom(result.error!).password).toBe("passwordRequired");
  });
});

describe("authErrorKey", () => {
  it.each([
    [{ code: "invalid_credentials" }, "invalidCredentials"],
    [{ code: "email_not_confirmed" }, "emailNotConfirmed"],
    [{ code: "captcha_failed" }, "captchaFailed"],
    [{ code: "over_email_send_rate_limit" }, "rateLimited"],
    [{ code: "over_request_rate_limit" }, "rateLimited"],
    [{ status: 429 }, "rateLimited"],
    [{ code: "weak_password" }, "passwordWeak"],
    [{ code: "same_password" }, "samePassword"],
    [{ code: "something_new" }, "generic"],
    [null, "generic"],
  ])("maps %j to %s", (error, key) => {
    expect(authErrorKey(error)).toBe(key);
  });
});
