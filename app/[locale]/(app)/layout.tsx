import { LogOut } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { BottomNav, SidebarNav, SidebarSettingsLink } from "@/components/layout/app-nav";
import { SkipLink } from "@/components/layout/skip-link";
import { UserMenu } from "@/components/layout/user-menu";
import { Link, redirect } from "@/i18n/navigation";
import { signOut } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AppLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  // The proxy already redirects signed-out visitors; this is the real check.
  const user = await getCurrentUser();
  if (!user) {
    return redirect({ href: "/login", locale });
  }

  const t = await getTranslations();
  const email = user.email ?? "";
  const initial = (email.trim()[0] ?? "?").toUpperCase();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <SkipLink label={t("common.skipToContent")} />

      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-line bg-white px-3 py-5 lg:flex">
        <Link href="/dashboard" aria-label={t("common.homeLink")} className="self-start rounded-md px-3 py-1">
          <Wordmark />
        </Link>
        <SidebarNav />
        <div className="mt-auto grid gap-2 border-t border-line pt-4">
          <SidebarSettingsLink />
          <p className="truncate px-3 text-xs text-ink-muted" title={email}>
            {email}
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-[0.9375rem] text-ink-muted hover:bg-navy-50 hover:text-ink"
            >
              <LogOut className="size-[1.125rem]" aria-hidden="true" />
              {t("nav.signOut")}
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white px-4 py-1.5 lg:hidden">
          <Link href="/dashboard" aria-label={t("common.homeLink")} className="rounded-md py-1">
            <Wordmark />
          </Link>
          <UserMenu email={email} initial={initial} />
        </header>
        <main id="main" className="w-full max-w-5xl flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-16">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
