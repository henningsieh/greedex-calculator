import HeroSection from "@/components/hero-section";
import WorkshopsHeroSection from "@/components/landingpage/workshops/workshops-hero-section";

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <section>
        <HeroSection />
      </section>

      <section>
        <WorkshopsHeroSection />
      </section>
    </main>
  );
}
