import { HeroHeader } from "@/components/header";

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeroHeader />
      {children}
    </>
  );
}
