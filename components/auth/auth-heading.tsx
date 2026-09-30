import type { ReactNode } from "react";

export function AuthHeading({ title, lead }: { title: ReactNode; lead?: ReactNode }) {
  return (
    <div className="mb-8 grid gap-2">
      <h1 className="text-title font-bold text-navy-950">{title}</h1>
      {lead ? <p className="text-base text-ink-muted">{lead}</p> : null}
    </div>
  );
}
