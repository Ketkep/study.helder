import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthHeading } from "@/components/auth/auth-heading";
import { buttonClasses } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.linkError");
  return { title: t("title") };
}

/** Shown when a confirmation or reset link is invalid, used or expired. */
export default async function AuthErrorPage() {
  const t = await getTranslations("auth.linkError");
  return (
    <>
      <AuthHeading title={t("title")} lead={t("body")} />
      <div className="grid gap-3">
        <Link href="/login" className={buttonClasses({ size: "lg", className: "w-full" })}>
          {t("toLogin")}
        </Link>
        <Link
          href="/forgot-password"
          className={buttonClasses({ variant: "secondary", size: "lg", className: "w-full" })}
        >
          {t("toForgot")}
        </Link>
      </div>
    </>
  );
}
