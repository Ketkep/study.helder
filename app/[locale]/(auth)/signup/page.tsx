import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthHeading } from "@/components/auth/auth-heading";
import { SignupForm } from "@/components/auth/signup-form";
import { Link } from "@/i18n/navigation";
import { getCaptchaConfig } from "@/lib/auth/captcha";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.signup");
  return { title: t("title") };
}

export default async function SignupPage() {
  const t = await getTranslations("auth.signup");

  return (
    <>
      <AuthHeading title={t("title")} lead={t("lead")} />
      <SignupForm captcha={await getCaptchaConfig()} />
      <p className="mt-8 border-t border-line pt-6 text-sm text-ink-muted">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-navy-700 underline-offset-4 hover:underline">
          {t("toLogin")}
        </Link>
      </p>
    </>
  );
}
