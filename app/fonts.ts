import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next } from "next/font/google";

// Downloaded at build time and served from our own domain (no requests to Google).
export const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  variable: "--font-atkinson",
  display: "swap",
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
  adjustFontFallback: false,
});

export const atkinsonMono = Atkinson_Hyperlegible_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-atkinson-mono",
  display: "swap",
  fallback: ["ui-monospace", "Cascadia Mono", "monospace"],
  adjustFontFallback: false,
});
