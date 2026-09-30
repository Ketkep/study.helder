"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

/**
 * Modal dialog built on the native <dialog> element: the browser traps focus,
 * closes on Escape and returns focus to the trigger when it closes.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  closeLabel,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  closeLabel: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> element itself.
        if (event.target === ref.current) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-line bg-white p-0 text-ink shadow-float"
    >
      <div className="grid gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-heading font-bold text-navy-950">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mt-1 -mr-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-md text-ink-muted hover:bg-navy-50 hover:text-ink"
          >
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">{closeLabel}</span>
          </button>
        </div>
        {description ? (
          <p id={descriptionId} className="text-base text-ink-muted">
            {description}
          </p>
        ) : null}
        {children}
        {footer ? <div className="flex flex-wrap justify-end gap-3 pt-2">{footer}</div> : null}
      </div>
    </dialog>
  );
}
