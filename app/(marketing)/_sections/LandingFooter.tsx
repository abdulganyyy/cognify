import Link from "next/link";
import { BookOpen } from "lucide-react";

const FOOTER_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

/**
 * LandingFooter
 * Minimal footer: logo + nav + copyright.
 */
export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-100 bg-white px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 md:flex-row md:justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 transition-all group-hover:bg-blue-700">
            <BookOpen className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-neutral-800">
            Cognify
          </span>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-5">
          {FOOTER_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-xs text-neutral-400 transition-colors hover:text-neutral-700"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-xs text-neutral-400">
          © {year} Cognify. All rights reserved.
        </p>
      </div>
    </footer>
  );
}