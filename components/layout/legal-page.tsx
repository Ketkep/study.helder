import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/ui/notice";

export function LegalPage({
  title,
  draftLabel,
  draftNotice,
  lastUpdated,
  points,
}: {
  title: string;
  draftLabel: string;
  draftNotice: string;
  lastUpdated: string;
  points: ReactNode[];
}) {
  return (
    <article className="mx-auto grid max-w-2xl gap-6 px-4 py-12 sm:px-6">
      <header className="grid justify-items-start gap-3">
        <Badge tone="warning">{draftLabel}</Badge>
        <h1 className="text-title font-bold text-navy-950">{title}</h1>
        <p className="text-sm text-ink-muted">{lastUpdated}</p>
      </header>
      <Notice tone="info">{draftNotice}</Notice>
      <ul className="grid gap-4 text-reading">
        {points.map((point, index) => (
          <li key={index} className="border-t border-line pt-4">
            {point}
          </li>
        ))}
      </ul>
    </article>
  );
}
