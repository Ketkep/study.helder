import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/layout/legal-page";

// Update when the text changes. Full legal review is required before a public launch.
const LAST_UPDATED = new Date("2026-09-30T12:00:00Z");

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "nl" | "en", namespace: "legal.privacy" });
  return {
    title: t("metaTitle"),
    alternates: { canonical: `/${locale}/privacy`, languages: { nl: "/nl/privacy", en: "/en/privacy" } },
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations();
  const format = await getFormatter();
  const email = t("common.contactEmail");
  const keys = ["who", "yours", "where", "cookies", "delete"] as const;

  return (
    <LegalPage
      title={t("legal.privacy.title")}
      draftLabel={t("common.draft")}
      draftNotice={t("legal.draftNotice")}
      lastUpdated={t("legal.lastUpdated", { date: format.dateTime(LAST_UPDATED, { dateStyle: "long" }) })}
      points={keys.map((key) => t(`legal.privacy.points.${key}`, { email }))}
    />
  );
}
