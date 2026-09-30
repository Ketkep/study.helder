import type { ReactNode } from "react";

export function PageHeader({
  title,
  eyebrow,
  actions,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-1">
        {eyebrow ? <p className="text-sm text-ink-muted">{eyebrow}</p> : null}
        <h1 className="text-title font-bold text-navy-950">{title}</h1>
      </div>
      {actions}
    </div>
  );
}
