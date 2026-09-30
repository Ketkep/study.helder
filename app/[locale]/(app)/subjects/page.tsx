import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.subjects");
  return { title: t("metaTitle") };
}

export default async function SubjectsPage() {
  const t = await getTranslations();
  return (
    <>
      <PageHeader title={t("app.subjects.title")} />
      <EmptyState
        title={t("app.subjects.emptyTitle")}
        description={t("app.subjects.emptyBody")}
        action={
          <Button disabled title={t("common.comingSoon")}>
            {t("app.subjects.emptyAction")}
          </Button>
        }
      />
    </>
  );
}
