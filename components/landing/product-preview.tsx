import { Check, X } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { MasteryBar } from "@/components/ui/progress";
import { SourceLabel } from "@/components/ui/source-label";
import { cn } from "@/lib/cn";
import { masteryLevel } from "@/lib/mastery";

const DEMO_TOPICS = [
  { key: "inflation", score: 78 },
  { key: "purchasingPower", score: 52 },
  { key: "realIncome", score: 31 },
] as const;

/** Example screens built from real components, filled with the demo subject. */
export async function ProductPreview() {
  const t = await getTranslations();
  const options = [
    { key: "A", text: t("landing.product.quizOptionA"), state: "chosen" as const },
    { key: "B", text: t("landing.product.quizOptionB"), state: "correct" as const },
    { key: "C", text: t("landing.product.quizOptionC"), state: "idle" as const },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-line-strong bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <p className="text-base font-bold text-navy-950">{t("landing.product.subject")}</p>
        <Badge>{t("landing.product.exampleBadge")}</Badge>
      </div>
      <div className="grid divide-y divide-line lg:grid-cols-[1fr_1.25fr_1.25fr] lg:divide-x lg:divide-y-0">
        <section className="grid content-start gap-4 p-5" aria-labelledby="preview-topics">
          <h3 id="preview-topics" className="text-sm font-semibold text-ink-muted">
            {t("landing.product.topicsTitle")}
          </h3>
          <ul className="grid gap-4">
            {DEMO_TOPICS.map((topic) => {
              const name = t(`landing.product.topics.${topic.key}`);
              const level = t(`mastery.${masteryLevel(topic.score)}`);
              return (
                <li key={topic.key} className="grid gap-2">
                  <span className="text-[0.9375rem] font-semibold">{name}</span>
                  <MasteryBar
                    score={topic.score}
                    levelLabel={level}
                    srLabel={t("mastery.label", { topic: name, level })}
                  />
                </li>
              );
            })}
          </ul>
        </section>

        <section className="grid content-start gap-3 p-5" aria-labelledby="preview-summary">
          <h3 id="preview-summary" className="text-sm font-semibold text-ink-muted">
            {t("landing.product.summaryTitle")}
          </h3>
          <p className="text-[0.9375rem] leading-relaxed">{t("landing.product.summaryBody1")}</p>
          <SourceLabel kind="user_material">{t("sources.user_material")}</SourceLabel>
          <p className="text-[0.9375rem] leading-relaxed">{t("landing.product.summaryBody2")}</p>
          <SourceLabel kind="ai_interpretation">{t("sources.ai_interpretation")}</SourceLabel>
        </section>

        <section className="grid content-start gap-3 p-5" aria-labelledby="preview-quiz">
          <h3 id="preview-quiz" className="text-sm font-semibold text-ink-muted">
            {t("landing.product.quizTitle")}
          </h3>
          <p className="text-[0.9375rem] font-semibold">{t("landing.product.quizQuestion")}</p>
          <ul className="grid gap-2">
            {options.map((option) => (
              <li
                key={option.key}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-sm",
                  option.state === "correct" && "border-success/40 bg-success-soft",
                  option.state === "chosen" && "border-error/40 bg-error-soft",
                  option.state === "idle" && "border-line",
                )}
              >
                <span>{option.text}</span>
                {option.state === "correct" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                    <Check className="size-3.5" aria-hidden="true" />
                    {t("landing.product.quizCorrect")}
                  </span>
                ) : null}
                {option.state === "chosen" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-error">
                    <X className="size-3.5" aria-hidden="true" />
                    {t("landing.product.quizYourAnswer")}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
          <div className="grid gap-1 border-t border-line pt-3">
            <p className="text-sm font-semibold">{t("landing.product.quizFeedbackTitle")}</p>
            <p className="text-sm text-ink-muted">{t("landing.product.quizFeedbackBody")}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
