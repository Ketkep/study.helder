import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthHeading } from "@/components/auth/auth-heading";
import { LoginForm } from "@/components/auth/login-form";
import { Notice } from "@/components/ui/notice";
import { Link } from "@/i18n/navigation";
import { getCaptchaConfig } from "@/lib/auth/captcha";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return { title: t("title") };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; notice?: string | string[] }>;
}) {
  const t = await getTranslations("auth.login");
  const { next, notice } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;

  return (
    <>
      <AuthHeading title={t("title")} lead={t("lead")} />
      {notice === "email-confirmed" ? (
        <Notice tone="success" className="mb-6">
          {t("emailConfirmed")}
        </Notice>
      ) : null}
      <LoginForm next={nextPath} captcha={await getCaptchaConfig()} />
      <p className="mt-8 border-t border-line pt-6 text-sm text-ink-muted">
        {t("noAccount")}{" "}
        <Link href="/signup" className="font-semibold text-navy-700 underline-offset-4 hover:underline">
          {t("toSignup")}
        </Link>
      </p>
    </>
  );
}
