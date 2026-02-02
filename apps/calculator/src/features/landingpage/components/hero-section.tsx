import { getTranslations } from "@greendex/i18n/server";

import { DASHBOARD_PATH } from "@/app/routes";
import { PillCTALink } from "@/features/landingpage/components/pill-cta";

/**
 * Hero Section - Clean centered layout (OpenClaw.ai style)
 * No hero image here - moved to PreviewSection below the fold
 */
export async function HeroSection() {
  const t = await getTranslations("landingPage");

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 pt-32 pb-16 md:min-h-[70vh] md:pt-28 md:pb-20">
      <div className="mx-auto max-w-4xl space-y-12 text-center">
        {/* Gradient Headline */}
        <div className="py-8">
          <h1 className="text-7xl font-extrabold tracking-tight text-balance md:text-7xl lg:text-7xl">
            <span className="bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">
              GREENDEX
            </span>
          </h1>
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl lg:text-5xl">
          {t("hero.headline")}
        </h2>

        {/* Subtitle */}
        <p
          className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {t("hero.subtitle")}
        </p>

        {/* Pill CTA */}
        <PillCTALink href={DASHBOARD_PATH} showNewBadge>
          {t("launchButton")}
        </PillCTALink>
      </div>
    </section>
  );
}
