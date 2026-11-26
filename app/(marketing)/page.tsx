import type { Metadata } from "next";
import { LandingNavbar } from "./_sections/LandingNavbar";
import { HeroSection } from "./_sections/HeroSection";
import { DashboardPreview } from "./_sections/DashboardPreview";
import { FeaturesSection } from "./_sections/FeaturesSection";
import { HowItWorksSection } from "./_sections/HowItWorksSection";
import { CtaSection } from "./_sections/CtaSection";
import { LandingFooter } from "./_sections/LandingFooter";

export const metadata: Metadata = {
  title: "Cognify — Belajar Lebih Cerdas dari Setiap PDF",
  description:
    "Unggah PDF dan biarkan AI menyusunnya menjadi ringkasan, topik utama, flashcard, dan tutor pribadi. Dibuat untuk mahasiswa yang ingin benar-benar memahami materi.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 antialiased">
      <LandingNavbar />
      <HeroSection />
      <DashboardPreview />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}