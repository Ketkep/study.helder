import { getTranslations } from "next-intl/server";
import { Wordmark } from "@/components/brand/wordmark";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";

export async function SiteFooter() {
  const t = await getTranslations();
  const email = t("common.contactEmail");
  const linkClass = "text-ink-muted underline-offset-4 hover:text-ink hover:underline";

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="grid max-w-md gap-3">
            <Wordmark byline={t("common.byline")} />
            <p className="text-sm text-ink-muted">{t("site.footer.aiNote")}</p>
          </div>
          <nav aria-label={t("site.nav")} className="grid gap-2 text-sm">
            <Link href="/privacy" className={linkClass}>
              {t("site.footer.privacy")}
            </Link>
            <Link href="/terms" className={linkClass}>
              {t("site.footer.terms")}
            </Link>
            <span className="text-ink-muted">
              {t("site.footer.contact")}:{" "}
              <a href={`mailto:${email}`} className={linkClass}>
                {email}
              </a>
            </span>
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4 text-xs text-ink-muted">
          <span>{t("site.footer.copyright", { year: new Date().getFullYear() })}</span>
          <LanguageSwitcher className="-mr-2 text-xs" />
        </div>
      </div>
    </footer>
  );
}
