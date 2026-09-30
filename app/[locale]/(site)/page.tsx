import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HeroDemo } from "@/components/landing/hero-demo";
import { ProductPreview } from "@/components/landing/product-preview";
import { buttonClasses } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: { canonical: `/${locale}`, languages: { nl: "/nl", en: "/en", "x-default": "/nl" } },
  };
}

const STEPS = ["add", "understand", "practice", "return"] as const;
const FEATURES = ["grounded", "flashcards", "quizzes", "sessions", "ask", "languages"] as const;

export default async function LandingPage() {
  const t = await getTranslations("landing");

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-14 sm:px-6 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:px-10 lg:pb-20">
        <div className="grid justify-items-start gap-5">
          <h1 className="text-[2.25rem] leading-[1.08] font-bold text-navy-950 sm:text-display">{t("hero.title")}</h1>
          <p className="max-w-[44ch] text-reading text-ink-muted">{t("hero.lead")}</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/signup" className={buttonClasses({ size: "lg" })}>
              {t("hero.primary")}
            </Link>
            <a href="#how" className={buttonClasses({ variant: "secondary", size: "lg" })}>
              {t("hero.secondary")}
            </a>
          </div>
        </div>
        <HeroDemo />
      </section>

      <section id="how" aria-labelledby="how-title" className="scroll-mt-4 border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-10">
          <h2 id="how-title" className="mb-8 text-heading font-bold text-navy-950">
            {t("how.title")}
          </h2>
          <ol className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step} className="grid content-start gap-1.5 bg-white p-5">
                <span className="font-mono text-sm font-semibold text-yellow-deep" aria-hidden="true">
                  {index + 1}
                </span>
                <h3 className="text-base font-bold">{t(`how.steps.${step}.title`)}</h3>
                <p className="text-sm text-ink-muted">{t(`how.steps.${step}.body`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="product-title" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-10">
        <div className="mb-6 grid gap-2">
          <h2 id="product-title" className="text-heading font-bold text-navy-950">
            {t("product.title")}
          </h2>
          <p className="text-ink-muted">{t("product.lead")}</p>
        </div>
        <ProductPreview />
      </section>

      <section aria-labelledby="features-title" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-10">
        <h2 id="features-title" className="mb-8 text-heading font-bold text-navy-950">
          {t("features.title")}
        </h2>
        <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <li key={feature} className="grid content-start gap-1.5 border-t-2 border-navy-900 pt-3">
              <h3 className="text-base font-bold">{t(`features.items.${feature}.title`)}</h3>
              <p className="text-[0.9375rem] text-ink-muted">{t(`features.items.${feature}.body`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="cta-title" className="bg-navy-950 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-12 sm:px-6 lg:px-10">
          <div className="grid gap-2">
            <h2 id="cta-title" className="text-heading font-bold sm:text-title">
              {t("cta.title")}
            </h2>
            <p className="text-navy-100">{t("cta.body")}</p>
          </div>
          <Link href="/signup" className={buttonClasses({ variant: "inverse", size: "lg" })}>
            {t("cta.button")}
          </Link>
        </div>
      </section>
    </>
  );
}
