import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * HeroSection
 *
 * Full-width hero dengan dot grid background.
 * Typography-first: DM Serif Display untuk headline, DM Sans untuk body.
 * Tidak ada hero image — kekuatan ada pada kata-kata dan whitespace.
 */
export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(circle, #d4d4d4 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        backgroundColor: "#FAFAFA",
      }}
    >
      {/* Fade overlay bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FAFAFA] to-transparent" />
      {/* Fade overlay sides */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#FAFAFA] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#FAFAFA] to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-24 md:pb-32 md:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          {/* Eyebrow badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1 text-xs font-medium text-blue-600">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
            </span>
            AI-powered learning, built for students
          </div>

          {/* Headline */}
          <h1
            className="mb-6 text-5xl font-normal leading-tight tracking-tight text-neutral-900 md:text-6xl lg:text-7xl"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Turn any PDF into{" "}
            <span className="italic text-blue-600">active knowledge</span>
          </h1>

          {/* Sub */}
          <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-neutral-500 md:text-lg">
            Upload a document. Cognify extracts what matters — summaries, key
            topics, flashcards, and an AI tutor that knows your material
            inside out.
          </p>

          {/* CTA group */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="h-11 gap-2 bg-blue-600 px-6 text-sm font-medium text-white hover:bg-blue-700 shadow-md shadow-blue-100"
            >
              <Link href="/register">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 gap-2 border-neutral-200 bg-white px-6 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <Link href="#preview">
                <FileText className="h-4 w-4 text-neutral-400" />
                See how it works
              </Link>
            </Button>
          </div>

          {/* Trust line */}
          <p className="mt-8 text-xs text-neutral-400">
            Free to start · No credit card required · Built for university
            students
          </p>
        </div>
      </div>

      {/* Google Font import via style tag — pragmatis untuk landing page */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        body { font-family: 'DM Sans', system-ui, sans-serif; }
      `}</style>
    </section>
  );
}