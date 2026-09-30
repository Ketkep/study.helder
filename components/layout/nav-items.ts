import { BarChart3, Home, Layers, Library, Settings, type LucideIcon } from "lucide-react";

export type NavKey = "dashboard" | "subjects" | "flashcards" | "progress" | "settings";

export type NavItem = { key: NavKey; href: `/${string}`; icon: LucideIcon };

/** Main places. On a phone these four are the bottom bar. */
export const MAIN_NAV: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: Home },
  { key: "subjects", href: "/subjects", icon: Library },
  { key: "flashcards", href: "/flashcards", icon: Layers },
  { key: "progress", href: "/progress", icon: BarChart3 },
];

export const SETTINGS_NAV: NavItem = { key: "settings", href: "/settings", icon: Settings };

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
