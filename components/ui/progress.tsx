import { cn } from "@/lib/cn";
import { clampScore, masteryLevel, type MasteryLevel } from "@/lib/mastery";

const levelFill: Record<MasteryLevel, string> = {
  needs_work: "bg-navy-300",
  learning: "bg-navy-500",
  strong: "bg-navy-700",
  mastered: "bg-navy-900",
};

/** A thin track with a navy fill. `label` is read by screen readers. */
export function ProgressBar({
  value,
  label,
  valueText,
  fillClassName = "bg-navy-900",
  className,
}: {
  value: number;
  label: string;
  valueText?: string;
  fillClassName?: string;
  className?: string;
}) {
  const clamped = clampScore(value);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-valuetext={valueText}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-navy-100", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-300", fillClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

/**
 * Mastery for one topic: level label, score and bar. The label always
 * accompanies the bar, so color is never the only signal.
 */
export function MasteryBar({
  score,
  levelLabel,
  srLabel,
  className,
}: {
  score: number;
  /** Translated label for masteryLevel(score), e.g. t(`mastery.${level}`). */
  levelLabel: string;
  srLabel: string;
  className?: string;
}) {
  const level = masteryLevel(score);
  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3 text-xs text-ink-muted">
        <span>{levelLabel}</span>
        <span className="font-mono tabular-nums">{clampScore(score)}</span>
      </div>
      <ProgressBar value={score} label={srLabel} valueText={levelLabel} fillClassName={levelFill[level]} />
    </div>
  );
}
