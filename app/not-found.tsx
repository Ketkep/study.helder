import Link from "next/link";
import { atkinson } from "./fonts";

// Only reached for paths outside /nl and /en that the proxy doesn't handle.
export default function RootNotFound() {
  return (
    <html lang="nl" className={atkinson.variable}>
      <body className="grid min-h-dvh place-items-center px-4">
        <main className="grid max-w-md gap-3">
          <h1 className="text-title font-bold text-navy-950">Deze pagina bestaat niet</h1>
          <p className="text-ink-muted" lang="en">
            This page doesn&apos;t exist.
          </p>
          <Link href="/" className="text-navy-700 underline underline-offset-4">
            Study
          </Link>
        </main>
      </body>
    </html>
  );
}
