"use client";

import { LogOut, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/lib/auth/actions";

/** Phone: the user's initial opens a small menu with Settings and Log out. */
export function UserMenu({ email, initial }: { email: string; initial: string }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const itemClass =
    "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-left text-[0.9375rem] text-ink hover:bg-navy-50";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t("accountMenu")}
        onClick={() => setOpen((value) => !value)}
        className="grid size-11 cursor-pointer place-items-center rounded-full"
      >
        <span className="grid size-9 place-items-center rounded-full bg-navy-900 text-sm font-bold text-white">
          {initial}
        </span>
      </button>
      <div
        id={menuId}
        hidden={!open}
        className="absolute top-full right-0 z-40 mt-1 w-64 rounded-lg border border-line bg-white p-2 shadow-float"
      >
        <p className="truncate px-3 pt-1 pb-2 text-xs text-ink-muted">
          {t("signedInAs")} <span className="font-semibold text-ink">{email}</span>
        </p>
        <Link href="/settings" className={itemClass} onClick={() => setOpen(false)}>
          <Settings className="size-4 text-ink-muted" aria-hidden="true" />
          {t("settings")}
        </Link>
        <form action={signOut}>
          <button type="submit" className={itemClass}>
            <LogOut className="size-4 text-ink-muted" aria-hidden="true" />
            {t("signOut")}
          </button>
        </form>
      </div>
    </div>
  );
}
