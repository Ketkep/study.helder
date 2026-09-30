"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { isActivePath, MAIN_NAV, SETTINGS_NAV, type NavItem } from "./nav-items";

function SidebarLink({ item }: { item: NavItem }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const active = isActivePath(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-10 items-center gap-3 rounded-md px-3 text-[0.9375rem] transition-colors duration-150",
        active ? "bg-navy-50 font-semibold text-navy-900" : "text-ink-muted hover:bg-navy-50 hover:text-ink",
      )}
    >
      <Icon className="size-[1.125rem] shrink-0" aria-hidden="true" />
      {t(item.key)}
    </Link>
  );
}

/** Desktop sidebar navigation. */
export function SidebarNav() {
  const t = useTranslations("nav");
  return (
    <nav aria-label={t("main")} className="grid gap-0.5">
      {MAIN_NAV.map((item) => (
        <SidebarLink key={item.key} item={item} />
      ))}
    </nav>
  );
}

export function SidebarSettingsLink() {
  return <SidebarLink item={SETTINGS_NAV} />;
}

/** Phone bottom bar: the four main places, reachable with one thumb. */
export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  return (
    <nav
      aria-label={t("main")}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {MAIN_NAV.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-xs",
                  active ? "font-semibold text-navy-900" : "text-ink-muted",
                )}
              >
                <Icon className="size-[1.375rem]" strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
                {t(item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
