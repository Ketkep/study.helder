import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * A bordered white surface. Use sparingly: only for the one element on a
 * screen that should stand apart (design principle: rules, not boxes).
 */
export function Surface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-line-strong bg-white p-5", className)} {...props} />;
}
