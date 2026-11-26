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
            Pembelajaran berbasis AI untuk mahasiswa
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-serif text-5xl font-normal leading-tight tracking-tight text-neutral-900 md:text-6xl lg:text-7xl">
            Ubah setiap PDF menjadi{" "}
            <span className="italic text-blue-600">pengetahuan aktif</span>
          </h1>

          {/* Sub */}
          <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-neutral-500 md:text-lg">
            Unggah dokumenmu. Cognify mengekstrak intisari terpenting — mulai dari
            ringkasan, topik kunci, flashcard, hingga Tutor AI yang memahami isi materimu.
          </p>

          {/* CTA group */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="h-11 gap-2 bg-blue-600 px-6 text-sm font-medium text-white hover:bg-blue-700 shadow-md shadow-blue-100"
            >
              <Link href="/register">
                Mulai Gratis
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
                Lihat Cara Kerja
              </Link>
            </Button>
          </div>

          {/* Trust line */}
          <p className="mt-8 text-xs text-neutral-400">
            Gratis untuk memulai · Tanpa kartu kredit · Dirancang untuk mahasiswa
          </p>
        </div>
      </div>
    </section>
  );
}