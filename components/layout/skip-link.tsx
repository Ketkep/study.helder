export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-md bg-navy-900 px-4 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      {label}
    </a>
  );
}
