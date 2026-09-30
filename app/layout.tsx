import type { ReactNode } from "react";
import "./globals.css";

// The real root layout (with <html>) is app/[locale]/layout.tsx, so the
// lang attribute always matches the page language.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
