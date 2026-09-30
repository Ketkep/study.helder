import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthHeading } from "@/components/auth/auth-heading";
import { ResendConfirmationForm } from "@/components/auth/email-link-forms";
import { Link } from "@/i18n/navigation";
import { getCaptchaConfig } from "@/lib/auth/captcha";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.checkEmail");
  return { title: t("title") };
}

export default async function CheckEmailPage() {
  const t = await getTranslations("auth.checkEmail");

  return (
    <>
      <AuthHeading title={t("title")} lead={t("body")} />
      <div className="grid gap-4 border-t border-line pt-6">
        <p className="text-sm text-ink-muted">{t("notReceived")}</p>
        <ResendConfirmationForm captcha={await getCaptchaConfig()} />
      </div>
      <p className="mt-8 text-sm">
        <Link href="/login" className="font-semibold text-navy-700 underline-offset-4 hover:underline">
          {t("back")}
        </Link>
      </p>
    </>
  );
}
