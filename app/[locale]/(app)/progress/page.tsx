import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/states";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.progress");
  return { title: t("metaTitle") };
}

export default async function ProgressPage() {
  const t = await getTranslations("app.progress");
  return (
    <>
      <PageHeader title={t("title")} />
      <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
    </>
  );
}
