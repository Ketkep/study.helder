import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export const inputClasses =
  "block w-full min-h-11 rounded-md border border-line-strong bg-white px-3 py-2 text-base text-ink " +
  "placeholder:text-ink-muted/70 transition-colors duration-150 " +
  "focus-visible:border-navy-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-navy-900 " +
  "aria-invalid:border-error disabled:bg-paper disabled:text-ink-muted";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
};

/** Label, input, hint and error, wired together for screen readers. */
export function TextField({ id, label, hint, error, className, ...inputProps }: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        className={inputClasses}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {error ? (
        <p id={errorId} className="text-sm text-error">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type CheckboxFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> & {
  id: string;
  label: ReactNode;
  error?: string;
};

export function CheckboxField({ id, label, error, className, ...inputProps }: CheckboxFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 size-5 shrink-0 cursor-pointer rounded-sm border-line-strong accent-navy-900"
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          {...inputProps}
        />
        <label htmlFor={id} className="cursor-pointer text-base text-ink">
          {label}
        </label>
      </div>
      {error ? (
        <p id={errorId} className="pl-8 text-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
