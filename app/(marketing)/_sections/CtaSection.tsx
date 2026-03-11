import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * CtaSection
 * Clean, centered CTA dengan soft background gradient dan border.
 */
export function CtaSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div
          className="relative overflow-hidden rounded-3xl border border-blue-100 px-8 py-16 text-center md:px-16 md:py-20"
          style={{
            background:
              "linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 50%, #EFF6FF 100%)",
          }}
        >
          {/* Subtle grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle, #bfdbfe 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Fade overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-50/60" />

          <div className="relative">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-500">
              Start learning today
            </p>
            <h2
              className="mb-5 text-4xl font-normal leading-tight text-neutral-900 md:text-5xl"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              Your documents deserve
              <br />
              <span className="italic text-blue-600">to be understood.</span>
            </h2>
            <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-neutral-500">
              Join students turning passive reading into real retention.
              Cognify is free to start — no credit card needed.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="h-11 gap-2 bg-blue-600 px-8 text-sm font-medium text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
              >
                <Link href="/register">
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 border-blue-200 bg-white/80 px-8 text-sm font-medium text-neutral-700 hover:bg-white"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>

            <p className="mt-6 text-xs text-neutral-400">
              Free plan includes 3 documents · No payment info required
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}