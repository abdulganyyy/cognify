import type { Metadata } from "next";
import { LandingNavbar } from "./_sections/LandingNavbar";
import { HeroSection } from "./_sections/HeroSection";
import { DashboardPreview } from "./_sections/DashboardPreview";
import { FeaturesSection } from "./_sections/FeaturesSection";
import { HowItWorksSection } from "./_sections/HowItWorksSection";
import { CtaSection } from "./_sections/CtaSection";
import { LandingFooter } from "./_sections/LandingFooter";

export const metadata: Metadata = {
  title: "Cognify — Learn Smarter from Any PDF",
  description:
    "Upload a PDF. Let AI distill it into summaries, topics, flashcards, and a personal tutor. Built for students who want to learn, not just read.",
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