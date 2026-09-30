"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

/** Link to the same page in the other language. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("language");
  const locale = useLocale();
  const pathname = usePathname();
  const other = locale === "nl" ? "en" : "nl";

  return (
    <Link
      href={pathname}
      locale={other}
      hrefLang={other}
      lang={other}
      aria-label={t("switchToLabel")}
      className={cn(
        "inline-flex min-h-11 items-center rounded-md px-2 text-sm text-ink-muted hover:bg-navy-50 hover:text-ink",
        className,
      )}
    >
      {t("switchTo")}
    </Link>
  );
}
