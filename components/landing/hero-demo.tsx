import { getTranslations } from "next-intl/server";
import { Highlight, SourceLabel } from "@/components/ui/source-label";

/** A real slice of the product: a passage from your material and the flashcard made from it. */
export async function HeroDemo() {
  const t = await getTranslations("landing.hero");
  return (
    <figure aria-label={t("demoLabel")} className="overflow-hidden rounded-lg border border-line bg-white">
      <div className="flex justify-between gap-4 border-b border-line px-4 py-3 text-xs text-ink-muted">
        <span>{t("demoSource")}</span>
        <span>{t("demoYours")}</span>
      </div>
      <p className="px-5 py-4 text-[0.9375rem] leading-relaxed">
        {t("demoPassageBefore")}
        <Highlight>{t("demoPassageHighlight")}</Highlight>
        {t("demoPassageAfter")}
      </p>
      <div className="mx-5 mb-5 grid gap-2 rounded-md border border-line-strong bg-paper px-4 py-3.5">
        <p className="text-[0.9375rem] font-semibold">{t("demoQuestion")}</p>
        <p className="text-sm text-ink-muted">{t("demoAnswer")}</p>
        <SourceLabel kind="user_material">{t("demoCitation")}</SourceLabel>
      </div>
    </figure>
  );
}
