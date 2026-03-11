import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * LandingNavbar
 * Sticky top navbar — minimal, no distractions.
 * Logo kiri, CTA kanan.
 */
export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-[#FAFAFA]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 transition-all group-hover:bg-blue-700">
            <BookOpen className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-neutral-900">
            Cognify
          </span>
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden items-center gap-6 md:flex">
          {[
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how-it-works" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-neutral-500 transition-colors hover:text-neutral-800"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm text-neutral-500 transition-colors hover:text-neutral-800 md:block"
          >
            Sign in
          </Link>
          <Button
            asChild
            size="sm"
            className="h-8 gap-1.5 bg-blue-600 px-4 text-xs font-medium text-white hover:bg-blue-700 shadow-sm shadow-blue-100"
          >
            <Link href="/register">Get started free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}