import { cn } from "@/lib/cn";

/** "Study" with the small yellow square, optionally followed by "by HelderLabs". */
export function Wordmark({
  byline,
  size = "md",
  className,
}: {
  byline?: string;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-extrabold tracking-[-0.02em] text-navy-900",
          size === "lg" ? "text-[1.625rem]" : "text-[1.375rem]",
        )}
      >
        Study
        <span className="ml-0.5 inline-block size-1.5 rounded-[1px] bg-yellow align-baseline" aria-hidden="true" />
      </span>
      {byline ? <span className="text-xs text-ink-muted">{byline}</span> : null}
    </span>
  );
}
