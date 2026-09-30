import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthHeading } from "@/components/auth/auth-heading";
import { ForgotPasswordForm } from "@/components/auth/email-link-forms";
import { Link } from "@/i18n/navigation";
import { getCaptchaConfig } from "@/lib/auth/captcha";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.forgot");
  return { title: t("title") };
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth.forgot");

  return (
    <>
      <AuthHeading title={t("title")} lead={t("lead")} />
      <ForgotPasswordForm captcha={await getCaptchaConfig()} />
      <p className="mt-8 border-t border-line pt-6 text-sm">
        <Link href="/login" className="font-semibold text-navy-700 underline-offset-4 hover:underline">
          {t("back")}
        </Link>
      </p>
    </>
  );
}
