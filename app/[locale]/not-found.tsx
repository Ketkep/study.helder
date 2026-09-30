import { getTranslations } from "next-intl/server";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonClasses } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations();
  return (
    <main id="main" className="mx-auto grid min-h-dvh max-w-md content-center justify-items-start gap-4 px-4 py-16">
      <Link href="/" aria-label={t("common.homeLink")} className="mb-4 rounded-md">
        <Wordmark />
      </Link>
      <h1 className="text-title font-bold text-navy-950">{t("errors.notFoundTitle")}</h1>
      <p className="text-ink-muted">{t("errors.notFoundBody")}</p>
      <Link href="/" className={buttonClasses({ className: "mt-2" })}>
        {t("errors.notFoundAction")}
      </Link>
    </main>
  );
}
