import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SkipLink } from "@/components/layout/skip-link";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations();
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink label={t("common.skipToContent")} />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/" aria-label={t("common.homeLink")} className="rounded-md py-1">
          <Wordmark byline={t("common.byline")} />
        </Link>
        <LanguageSwitcher />
      </header>
      <main id="main" className="flex flex-1 justify-center px-4 pt-8 pb-16 sm:pt-16">
        <div className="w-full max-w-sm">{children}</div>
      </main>
      <footer className="flex justify-center gap-6 px-4 pb-8 text-xs text-ink-muted">
        <Link href="/privacy" className="hover:text-ink hover:underline">
          {t("site.footer.privacy")}
        </Link>
        <Link href="/terms" className="hover:text-ink hover:underline">
          {t("site.footer.terms")}
        </Link>
      </footer>
    </div>
  );
}
