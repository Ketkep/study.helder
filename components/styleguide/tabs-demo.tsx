"use client";

import { useTranslations } from "next-intl";
import { Tabs } from "@/components/ui/tabs";

export function TabsDemo() {
  const t = useTranslations("styleguide");
  const tabs = [
    { id: "overview", label: t("tabOverview") },
    { id: "learn", label: t("tabLearn") },
    { id: "material", label: t("tabMaterial") },
    { id: "ask", label: t("tabAsk") },
  ];
  return (
    <Tabs
      label={t("tabs")}
      items={tabs.map((tab) => ({
        ...tab,
        content: <p className="text-ink-muted">{t("tabPanel", { tab: tab.label })}</p>,
      }))}
    />
  );
}
