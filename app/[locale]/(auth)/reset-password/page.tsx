import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthHeading } from "@/components/auth/auth-heading";
import { NewPasswordForm } from "@/components/auth/new-password-form";
import { buttonClasses } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.reset");
  return { title: t("title") };
}

/** Reached from the reset link in the email, which signs the user in first. */
export default async function ResetPasswordPage() {
  const t = await getTranslations("auth.reset");
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <AuthHeading title={t("invalidTitle")} lead={t("invalidBody")} />
        <Link href="/forgot-password" className={buttonClasses({ size: "lg", className: "w-full" })}>
          {t("requestNew")}
        </Link>
      </>
    );
  }

  return (
    <>
      <AuthHeading title={t("title")} lead={t("lead")} />
      <NewPasswordForm from="reset" />
    </>
  );
}
