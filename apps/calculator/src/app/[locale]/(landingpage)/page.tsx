import { GlobeSection } from "@/features/landingpage/components/globe-section";
import { HeroSection } from "@/features/landingpage/components/hero-section";
import { PreviewSection } from "@/features/landingpage/components/preview-section";
import { WorkshopsHeroSection } from "@/features/landingpage/components/workshops/workshops-hero-section";

/**
 * Render the landing page with the following structure:
 * 1. HeroSection - Clean centered headline with CTA (no image)
 * 2. WorkshopsHeroSection - MOST prominent section (moved up)
 * 3. PreviewSection - Hero image below the fold
 * 4. GlobeSection - Keep existing globe
 *
 * @returns The JSX element for the landing page.
 */
export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      {/* Hero - Clean centered, no image */}
      <HeroSection />

      {/* Workshops - MOST prominent section */}
      <WorkshopsHeroSection />

      {/* Preview - Hero image below the fold */}
      <PreviewSection />

      {/* Globe - Keep existing */}
      <GlobeSection />
    </main>
  );
}
