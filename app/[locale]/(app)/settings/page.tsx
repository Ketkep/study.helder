import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { NewPasswordForm } from "@/components/auth/new-password-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { locales } from "@/i18n/routing";
import { signOut, updateLanguage } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.settings");
  return { title: t("metaTitle") };
}

function Section({ id, title, lead, children }: { id: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-4 border-t border-line py-8 md:grid-cols-[14rem_1fr] md:gap-10">
      <div className="grid content-start gap-1">
        <h2 id={id} className="text-base font-bold">
          {title}
        </h2>
        {lead ? <p className="text-sm text-ink-muted">{lead}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const t = await getTranslations();
  const locale = await getLocale();
  const user = await getCurrentUser();
  const { notice } = await searchParams;

  return (
    <>
      <PageHeader title={t("app.settings.title")} />

      <Section id="settings-language" title={t("app.settings.language.title")} lead={t("app.settings.language.lead")}>
        <form action={updateLanguage} className="grid max-w-md gap-4">
          <input type="hidden" name="locale" value={locale} />
          <fieldset className="grid gap-2">
            <legend className="sr-only">{t("language.label")}</legend>
            {locales.map((option) => (
              <label
                key={option}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-line bg-white px-3 has-checked:border-navy-900"
              >
                <input
                  type="radio"
                  name="language"
                  value={option}
                  defaultChecked={option === locale}
                  className="size-4 accent-navy-900"
                />
                <span lang={option}>{t(`language.${option}`)}</span>
              </label>
            ))}
          </fieldset>
          {notice === "language-saved" ? <Notice tone="success">{t("app.settings.language.saved")}</Notice> : null}
          {notice === "language-error" ? <Notice tone="error">{t("auth.errors.generic")}</Notice> : null}
          <Button type="submit" variant="secondary" className="justify-self-start">
            {t("app.settings.language.submit")}
          </Button>
        </form>
      </Section>

      <Section id="settings-account" title={t("app.settings.account.title")}>
        <dl className="grid gap-1">
          <dt className="text-sm text-ink-muted">{t("app.settings.account.email")}</dt>
          <dd className="font-semibold break-all">{user?.email}</dd>
        </dl>
      </Section>

      <Section id="settings-password" title={t("app.settings.password.title")}>
        <NewPasswordForm from="settings" />
      </Section>

      <Section id="settings-data" title={t("app.settings.data.title")}>
        <p className="max-w-prose text-ink-muted">{t("app.settings.data.body", { email: t("common.contactEmail") })}</p>
      </Section>

      <Section id="settings-signout" title={t("app.settings.signOut.title")} lead={t("app.settings.signOut.body")}>
        <form action={signOut}>
          <input type="hidden" name="locale" value={locale} />
          <Button type="submit" variant="secondary">
            {t("app.settings.signOut.submit")}
          </Button>
        </form>
      </Section>
    </>
  );
}
