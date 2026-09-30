import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type NoticeTone = "info" | "success" | "warning" | "error";

const tones: Record<NoticeTone, { box: string; icon: typeof Info }> = {
  info: { box: "border-navy-100 bg-navy-50 text-ink", icon: Info },
  success: { box: "border-success/25 bg-success-soft text-ink", icon: CheckCircle2 },
  warning: { box: "border-warning/25 bg-warning-soft text-ink", icon: AlertTriangle },
  error: { box: "border-error/25 bg-error-soft text-ink", icon: XCircle },
};

const iconColor: Record<NoticeTone, string> = {
  info: "text-navy-700",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

/** Inline message. Errors are announced immediately, others politely. */
export function Notice({
  tone = "info",
  children,
  className,
}: {
  tone?: NoticeTone;
  children: ReactNode;
  className?: string;
}) {
  const { box, icon: Icon } = tones[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-md border px-4 py-3 text-sm", box, className)}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", iconColor[tone])} aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
