import { z } from "zod";
import type messages from "@/messages/en.json";

export type AuthErrorKey = keyof (typeof messages)["auth"]["errors"];

export const PASSWORD_MIN = 8;
// Supabase hashes passwords with bcrypt, which only uses the first 72 bytes.
export const PASSWORD_MAX = 72;

const email = z
  .string({ error: "emailInvalid" })
  .trim()
  .toLowerCase()
  .max(254, { error: "emailInvalid" })
  .pipe(z.email({ error: "emailInvalid" }));

const newPassword = z
  .string({ error: "passwordTooShort" })
  .min(PASSWORD_MIN, { error: "passwordTooShort" })
  .refine((value) => new TextEncoder().encode(value).length <= PASSWORD_MAX, { error: "passwordTooLong" });

export const signUpSchema = z.object({
  email,
  password: newPassword,
  // A checked checkbox submits "on"; an unchecked one submits nothing.
  age: z.literal("on", { error: "ageRequired" }),
});

export const signInSchema = z.object({
  email,
  password: z.string({ error: "passwordRequired" }).min(1, { error: "passwordRequired" }).max(1024),
});

export const emailOnlySchema = z.object({ email });

export const newPasswordSchema = z.object({ password: newPassword });

export const changePasswordSchema = z.object({
  currentPassword: z.string({ error: "passwordRequired" }).min(1, { error: "passwordRequired" }).max(1024),
  password: newPassword,
});

export type FieldName = "email" | "password" | "currentPassword" | "age";

/** Turns zod issues into { field: errorKey }, keeping the first error per field. */
export function fieldErrorsFrom(error: z.ZodError): Partial<Record<FieldName, AuthErrorKey>> {
  const result: Partial<Record<FieldName, AuthErrorKey>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as FieldName | undefined;
    if (field && !result[field]) result[field] = issue.message as AuthErrorKey;
  }
  return result;
}
