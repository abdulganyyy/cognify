import {
  Sparkles,
  Layers,
  CreditCard,
  MessageSquare,
} from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    color: "text-blue-500",
    bg: "bg-blue-50",
    ring: "ring-blue-100",
    title: "AI Summary",
    description:
      "Every document is condensed into a clear, structured summary — preserving what matters, removing what doesn't.",
  },
  {
    icon: Layers,
    color: "text-violet-500",
    bg: "bg-violet-50",
    ring: "ring-violet-100",
    title: "Key Topics",
    description:
      "Cognify maps the conceptual landscape of your document so you always know what to study next.",
  },
  {
    icon: CreditCard,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    ring: "ring-emerald-100",
    title: "Flashcards",
    description:
      "Automatically generated Q&A pairs based on your material. Spaced repetition, without the manual work.",
  },
  {
    icon: MessageSquare,
    color: "text-amber-500",
    bg: "bg-amber-50",
    ring: "ring-amber-100",
    title: "Document Chat",
    description:
      "Ask anything about your PDF. The AI answers only from your document — no hallucinations, no noise.",
  },
];

/**
 * FeaturesSection
 * 2×2 grid, clean card layout with icon, title, description.
 */
export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 max-w-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
            What you get
          </p>
          <h2
            className="mb-4 text-4xl font-normal text-neutral-900 leading-snug"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Four tools. One document.{" "}
            <span className="italic text-blue-600">Everything you need.</span>
          </h2>
          <p className="text-base text-neutral-500 leading-relaxed">
            Cognify turns passive reading into active learning with a suite of
            AI tools that work the moment you upload.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, color, bg, ring, title, description }) => (
            <div
              key={title}
              className="group flex flex-col gap-4 rounded-2xl border border-neutral-100 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-neutral-100"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${bg} ${ring}`}
              >
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <h3 className="mb-1.5 text-sm font-semibold text-neutral-800">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-500">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}