import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { DialogDemo } from "@/components/styleguide/dialog-demo";
import { TabsDemo } from "@/components/styleguide/tabs-demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckboxField, TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { MasteryBar, ProgressBar } from "@/components/ui/progress";
import { Highlight, SourceLabel } from "@/components/ui/source-label";
import { EmptyState, ErrorState, LoadingState, Skeleton } from "@/components/ui/states";
import { Surface } from "@/components/ui/surface";
import { isProductionDeployment } from "@/lib/env";
import { masteryLevel } from "@/lib/mastery";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getTranslations("styleguide");
  return { title: s("title"), robots: { index: false, follow: false } };
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line py-8">
      <h2 className="text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

export default async function StyleguidePage() {
  if (isProductionDeployment()) notFound();
  const t = await getTranslations();
  const s = await getTranslations("styleguide");

  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Wordmark byline={t("common.byline")} size="lg" />
      <h1 className="mt-6 text-title font-bold text-navy-950">{s("title")}</h1>
      <p className="mt-2 mb-6 text-ink-muted">{s("lead")}</p>

      <Block title={s("buttons")}>
        <div className="flex flex-wrap items-center gap-3">
          <Button>{s("primary")}</Button>
          <Button variant="secondary">{s("secondary")}</Button>
          <Button variant="ghost">{s("ghost")}</Button>
          <Button variant="danger">{s("danger")}</Button>
          <Button pending pendingLabel={s("pending")}>
            {s("primary")}
          </Button>
          <Button disabled>{s("primary")}</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">{s("primary")}</Button>
          <Button size="lg" variant="secondary">
            {s("secondary")}
          </Button>
        </div>
      </Block>

      <Block title={s("inputs")}>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="sg-email"
            name="sg-email"
            type="email"
            label={t("auth.email")}
            defaultValue={s("exampleEmail")}
            hint={t("auth.passwordHint")}
          />
          <TextField
            id="sg-password"
            name="sg-password"
            type="password"
            label={t("auth.password")}
            defaultValue="1234"
            error={s("exampleError")}
          />
        </div>
        <CheckboxField id="sg-age" name="sg-age" label={t("auth.signup.age")} />
      </Block>

      <Block title={s("sourceLabels")}>
        <div className="flex flex-wrap gap-5">
          <SourceLabel kind="user_material">{t("sources.user_material")}</SourceLabel>
          <SourceLabel kind="ai_interpretation">{t("sources.ai_interpretation")}</SourceLabel>
          <SourceLabel kind="external">{t("sources.external")}</SourceLabel>
        </div>
        <p className="max-w-prose text-reading">
          {s.rich("highlightText", { mark: (chunks) => <Highlight>{chunks}</Highlight> })}
        </p>
      </Block>

      <Block title={s("badges")}>
        <div className="flex flex-wrap gap-3">
          <Badge tone="due">{s("due")}</Badge>
          <Badge>{s("topics")}</Badge>
          <Badge tone="success">{s("correct")}</Badge>
          <Badge tone="warning">{s("limit")}</Badge>
        </div>
      </Block>

      <Block title={s("tabs")}>
        <TabsDemo />
      </Block>

      <Block title={s("progress")}>
        <div className="grid max-w-sm gap-2">
          <p className="font-mono text-sm text-ink-muted">{s("sessionProgress")}</p>
          <ProgressBar value={44} label={s("sessionProgress")} />
        </div>
        <div className="grid gap-5 sm:grid-cols-4">
          {[22, 54, 78, 95].map((score) => {
            const level = t(`mastery.${masteryLevel(score)}`);
            return (
              <MasteryBar
                key={score}
                score={score}
                levelLabel={level}
                srLabel={t("mastery.label", { topic: "Demo", level })}
              />
            );
          })}
        </div>
      </Block>

      <Block title={s("dialog")}>
        <div>
          <DialogDemo />
        </div>
      </Block>

      <Block title={s("notices")}>
        <div className="grid gap-3">
          <Notice tone="info">{s("noticeInfo")}</Notice>
          <Notice tone="success">{s("noticeSuccess")}</Notice>
          <Notice tone="warning">{s("noticeWarning")}</Notice>
          <Notice tone="error">{s("noticeError")}</Notice>
        </div>
      </Block>

      <Block title={s("states")}>
        <EmptyState title={s("emptyTitle")} description={s("emptyBody")} action={<Button>{s("primary")}</Button>} />
        <LoadingState label={s("loadingText")} />
        <div className="grid max-w-md gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <ErrorState
          title={t("errors.errorTitle")}
          description={s("noticeError")}
          action={<Button variant="secondary">{t("errors.errorAction")}</Button>}
        />
      </Block>

      <Block title={s("surface")}>
        <Surface className="max-w-md">
          <p>{s("surfaceBody")}</p>
        </Surface>
      </Block>
    </main>
  );
}
