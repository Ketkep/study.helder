import { getTranslations } from "next-intl/server";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonClasses } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { hasSession } from "@/lib/auth/session";
import { LanguageSwitcher } from "./language-switcher";

export async function SiteHeader() {
  const t = await getTranslations();
  const signedIn = await hasSession();

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/" aria-label={t("common.homeLink")} className="rounded-md py-1">
          <Wordmark byline={t("common.byline")} />
        </Link>
        <nav aria-label={t("site.nav")} className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/#how"
            className="hidden min-h-11 items-center rounded-md px-2 text-sm text-ink-muted hover:bg-navy-50 hover:text-ink md:inline-flex"
          >
            {t("site.howItWorks")}
          </Link>
          <LanguageSwitcher />
          {signedIn ? (
            <Link href="/dashboard" className={buttonClasses({ variant: "primary" })}>
              {t("site.toApp")}
            </Link>
          ) : (
            <>
              <Link href="/login" className={buttonClasses({ variant: "ghost", className: "px-3" })}>
                {t("site.login")}
              </Link>
              <Link
                href="/signup"
                className={buttonClasses({ variant: "primary", className: "hidden sm:inline-flex" })}
              >
                {t("site.start")}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
