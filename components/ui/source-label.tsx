import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SourceKind = "user_material" | "ai_interpretation" | "external";

const markers: Record<SourceKind, string> = {
  user_material: "bg-yellow",
  ai_interpretation: "border-[1.5px] border-yellow-deep bg-transparent",
  external: "bg-navy-300",
};

/**
 * Small, quiet label that says where content comes from (SPEC 3.3).
 * Pass the translated text as children, e.g. t("sources.user_material").
 */
export function SourceLabel({
  kind,
  className,
  children,
}: {
  kind: SourceKind;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-ink-muted", className)}>
      <span className={cn("inline-block size-2 shrink-0 rounded-[2px]", markers[kind])} aria-hidden="true" />
      {children}
    </span>
  );
}

/** Highlighter mark for passages quoted from the student's material. */
export function Highlight({ children }: { children: ReactNode }) {
  return <mark className="border-b-2 border-yellow bg-yellow-soft px-0.5 text-inherit">{children}</mark>;
}
