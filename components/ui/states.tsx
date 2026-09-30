import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid max-w-xl justify-items-start gap-3 border-t border-line py-8", className)}>
      <h2 className="text-heading font-bold text-navy-950">{title}</h2>
      {description ? <p className="text-base text-ink-muted">{description}</p> : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ label, className }: { label: string; className?: string }) {
  return (
    <div role="status" className={cn("flex items-center gap-3 py-6 text-ink-muted", className)}>
      <Spinner className="size-5 text-navy-700" />
      <span>{label}</span>
    </div>
  );
}

/** Placeholder block while content loads. Decorative, hidden from screen readers. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-navy-100 motion-reduce:animate-none", className)}
    />
  );
}

export function ErrorState({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("grid max-w-xl justify-items-start gap-3 border-t border-line py-8", className)}>
      <h2 className="text-heading font-bold text-navy-950">{title}</h2>
      {description ? <p className="text-base text-ink-muted">{description}</p> : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}
