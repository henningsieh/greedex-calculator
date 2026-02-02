"use client";

/**
 * Static, theme-aware background component for landing pages
 * Evokes European landscape - countryside morning light in light mode,
 * deep forest tones in dark mode. No continuous animations.
 *
 * Style inspired by OpenClaw.ai - subtle particles, soft gradients,
 * environmental feel without being distracting.
 */
export function LandingPageBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
    >
      {/* Light theme: Soft European countryside morning gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-sky-50 via-emerald-50/30 to-amber-50/20 dark:opacity-0" />

      {/* Light theme: Soft horizon glow */}
      <div
        className="absolute inset-0 opacity-60 dark:opacity-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(186, 230, 253, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(167, 243, 208, 0.3) 0%, transparent 40%),
            radial-gradient(ellipse 50% 30% at 20% 80%, rgba(254, 240, 138, 0.2) 0%, transparent 40%)
          `,
        }}
      />

      {/* Dark theme: Deep forest tones */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 100% 60% at 50% 100%, rgba(20, 83, 45, 0.4) 0%, transparent 60%),
              radial-gradient(ellipse 80% 50% at 20% 0%, rgba(6, 78, 59, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 30%, rgba(22, 101, 52, 0.25) 0%, transparent 40%)
            `,
          }}
        />
      </div>

      {/* Subtle organic texture overlay - very light */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Static particles - subtle environmental feel like OpenClaw.ai */}
      {/* Light theme particles */}
      <div className="absolute inset-0 dark:opacity-0">
        {/* Top-left cluster - pollen/dust in morning light */}
        <div className="absolute top-[10%] left-[15%] size-1 rounded-full bg-emerald-400/20" />
        <div className="absolute top-[15%] left-[10%] size-0.5 rounded-full bg-sky-400/25" />
        <div className="absolute top-[8%] left-[20%] size-0.5 rounded-full bg-emerald-300/20" />
        <div className="absolute top-[20%] left-[12%] size-1 rounded-full bg-amber-300/15" />

        {/* Top-right cluster */}
        <div className="absolute top-[12%] right-[18%] size-0.5 rounded-full bg-sky-300/20" />
        <div className="absolute top-[18%] right-[12%] size-1 rounded-full bg-emerald-400/15" />
        <div className="absolute top-[8%] right-[25%] size-0.5 rounded-full bg-amber-200/20" />

        {/* Bottom-left cluster */}
        <div className="absolute bottom-[20%] left-[8%] size-1 rounded-full bg-emerald-300/18" />
        <div className="absolute bottom-[15%] left-[15%] size-0.5 rounded-full bg-sky-400/15" />

        {/* Bottom-right cluster */}
        <div className="absolute right-[20%] bottom-[18%] size-0.5 rounded-full bg-emerald-400/20" />
        <div className="absolute right-[10%] bottom-[25%] size-1 rounded-full bg-amber-300/12" />

        {/* Scattered particles */}
        <div className="absolute top-[35%] left-[5%] size-0.5 rounded-full bg-sky-300/15" />
        <div className="absolute top-[45%] right-[8%] size-0.5 rounded-full bg-emerald-300/18" />
        <div className="absolute top-[60%] left-[25%] size-0.5 rounded-full bg-amber-200/10" />
        <div className="absolute top-[70%] right-[30%] size-1 rounded-full bg-sky-400/12" />
        <div className="absolute top-[55%] left-[40%] size-0.5 rounded-full bg-emerald-400/15" />
        <div className="absolute top-[80%] left-[60%] size-0.5 rounded-full bg-amber-300/15" />
        <div className="absolute top-[40%] right-[45%] size-0.5 rounded-full bg-sky-300/12" />
        <div className="absolute top-[65%] left-[75%] size-1 rounded-full bg-emerald-300/10" />
        <div className="absolute top-[25%] left-[50%] size-0.5 rounded-full bg-amber-200/15" />
        <div className="absolute top-[85%] right-[15%] size-0.5 rounded-full bg-sky-400/10" />
        <div className="absolute top-[50%] left-[85%] size-0.5 rounded-full bg-emerald-400/12" />
        <div className="absolute top-[30%] right-[60%] size-1 rounded-full bg-amber-300/10" />
      </div>

      {/* Dark theme particles - fireflies/spores in forest */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100">
        {/* Top-left cluster */}
        <div className="absolute top-[10%] left-[15%] size-1 rounded-full bg-emerald-400/30" />
        <div className="absolute top-[15%] left-[10%] size-0.5 rounded-full bg-teal-400/25" />
        <div className="absolute top-[8%] left-[20%] size-0.5 rounded-full bg-emerald-300/20" />
        <div className="absolute top-[20%] left-[12%] size-1 rounded-full bg-green-400/20" />

        {/* Top-right cluster */}
        <div className="absolute top-[12%] right-[18%] size-0.5 rounded-full bg-teal-300/25" />
        <div className="absolute top-[18%] right-[12%] size-1 rounded-full bg-emerald-400/20" />
        <div className="absolute top-[8%] right-[25%] size-0.5 rounded-full bg-green-300/20" />

        {/* Bottom-left cluster */}
        <div className="absolute bottom-[20%] left-[8%] size-1 rounded-full bg-emerald-300/25" />
        <div className="absolute bottom-[15%] left-[15%] size-0.5 rounded-full bg-teal-400/20" />

        {/* Bottom-right cluster */}
        <div className="absolute right-[20%] bottom-[18%] size-0.5 rounded-full bg-emerald-400/25" />
        <div className="absolute right-[10%] bottom-[25%] size-1 rounded-full bg-green-400/18" />

        {/* Scattered particles */}
        <div className="absolute top-[35%] left-[5%] size-0.5 rounded-full bg-teal-300/20" />
        <div className="absolute top-[45%] right-[8%] size-0.5 rounded-full bg-emerald-300/22" />
        <div className="absolute top-[60%] left-[25%] size-0.5 rounded-full bg-green-300/15" />
        <div className="absolute top-[70%] right-[30%] size-1 rounded-full bg-teal-400/18" />
        <div className="absolute top-[55%] left-[40%] size-0.5 rounded-full bg-emerald-400/20" />
        <div className="absolute top-[80%] left-[60%] size-0.5 rounded-full bg-green-300/18" />
        <div className="absolute top-[40%] right-[45%] size-0.5 rounded-full bg-teal-300/15" />
        <div className="absolute top-[65%] left-[75%] size-1 rounded-full bg-emerald-300/15" />
        <div className="absolute top-[25%] left-[50%] size-0.5 rounded-full bg-green-400/18" />
        <div className="absolute top-[85%] right-[15%] size-0.5 rounded-full bg-teal-400/12" />
        <div className="absolute top-[50%] left-[85%] size-0.5 rounded-full bg-emerald-400/15" />
        <div className="absolute top-[30%] right-[60%] size-1 rounded-full bg-green-300/12" />
      </div>

      {/* Bottom fade to background color */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />
    </div>
  );
}
