"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * Cloudflare Turnstile widget. Only rendered when NEXT_PUBLIC_TURNSTILE_SITE_KEY
 * is set. Place it inside a <form>: it adds a hidden "cf-turnstile-response"
 * field that the server action forwards to Supabase.
 *
 * Tokens work once, so change `resetKey` after every submit to get a new one.
 */
export function Turnstile({
  siteKey,
  nonce,
  locale,
  resetKey,
  label,
}: {
  siteKey: string;
  nonce?: string;
  locale: string;
  resetKey?: unknown;
  label: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [ready, setReady] = useState(() => typeof window !== "undefined" && Boolean(window.turnstile));

  const render = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      language: locale,
      size: "flexible",
      theme: "light",
    });
  }, [siteKey, locale]);

  useEffect(() => {
    if (ready) render();
  }, [ready, render]);

  useEffect(() => {
    if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
  }, [resetKey]);

  useEffect(
    () => () => {
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    },
    [],
  );

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        nonce={nonce}
        onReady={() => setReady(true)}
      />
      <div ref={containerRef} aria-label={label} className="min-h-[65px]" />
    </>
  );
}
