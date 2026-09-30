import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "inverse";
export type ButtonSize = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md border font-semibold leading-none whitespace-nowrap " +
  "transition-[background-color,transform,border-color] duration-150 active:translate-y-px " +
  "disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-y-0 cursor-pointer";

const variants: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-navy-900 text-white hover:bg-navy-950",
  secondary: "border-line-strong bg-white text-navy-900 hover:border-navy-300 hover:bg-navy-50",
  ghost: "border-transparent bg-transparent text-navy-900 hover:bg-navy-50",
  danger: "border-transparent bg-error text-white hover:bg-error/90",
  // On navy backgrounds.
  inverse: "border-transparent bg-white text-navy-950 hover:bg-navy-50",
};

const sizes: Record<ButtonSize, string> = {
  // 44px minimum height: comfortable touch target.
  md: "min-h-11 px-4 text-[0.9375rem]",
  lg: "min-h-14 px-6 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, disables the button and announces the busy state. */
  pending?: boolean;
  pendingLabel?: string;
};

export function Button({
  variant,
  size,
  pending = false,
  pendingLabel,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      {...props}
    >
      {pending ? <Spinner className="size-4" /> : null}
      <span>{pending && pendingLabel ? pendingLabel : children}</span>
    </button>
  );
}
