import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { EmptyState } from "@/components/ui/states";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.dashboard");
  return { title: t("metaTitle") };
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const t = await getTranslations();
  const format = await getFormatter();
  const { notice } = await searchParams;
  const date = format.dateTime(new Date(), { weekday: "long", day: "numeric", month: "long" });
  // Dutch weekdays are lowercase; at the start of a line they need a capital.
  const today = date.charAt(0).toLocaleUpperCase() + date.slice(1);

  return (
    <>
      {notice === "password-updated" ? (
        <Notice tone="success" className="mb-6">
          {t("app.dashboard.passwordUpdated")}
        </Notice>
      ) : null}
      <PageHeader eyebrow={today} title={t("app.dashboard.title")} />
      {/* Subjects arrive in Phase 2; until then the dashboard shows its empty state. */}
      <EmptyState
        title={t("app.dashboard.emptyTitle")}
        description={t("app.dashboard.emptyBody")}
        action={
          <Button disabled title={t("common.comingSoon")}>
            {t("app.dashboard.emptyAction")}
          </Button>
        }
      />
    </>
  );
}
