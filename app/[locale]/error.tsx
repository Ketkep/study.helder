"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errors");

  useEffect(() => {
    // Only the digest reaches the browser in production; details stay in server logs.
    console.error(error.digest ?? error.message);
  }, [error]);

  return (
    <main id="main" className="mx-auto grid max-w-md content-center justify-items-start gap-4 px-4 py-16">
      <h1 className="text-title font-bold text-navy-950">{t("errorTitle")}</h1>
      <p className="text-ink-muted">{t("errorBody")}</p>
      <Button onClick={reset} className="mt-2">
        {t("errorAction")}
      </Button>
    </main>
  );
}
