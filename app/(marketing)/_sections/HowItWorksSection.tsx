const STEPS = [
  {
    number: "01",
    title: "Upload your PDF",
    description:
      "Drag and drop any academic document, textbook chapter, or lecture note. Up to 10 MB.",
    detail: "Supports all standard PDFs — scanned or digital.",
  },
  {
    number: "02",
    title: "AI processes your document",
    description:
      "Cognify extracts, chunks, and embeds your content into a private knowledge base in seconds.",
    detail: "All processing happens securely on our servers.",
  },
  {
    number: "03",
    title: "Explore your learning kit",
    description:
      "Your document becomes a summary, topic map, flashcard deck, and a chat-ready AI tutor — instantly.",
    detail: "No prompting required. Just open and learn.",
  },
  {
    number: "04",
    title: "Study, revisit, retain",
    description:
      "Come back anytime. Your documents and sessions are saved so you can pick up exactly where you left off.",
    detail: "Bookmark topics, review flashcards, ask follow-ups.",
  },
];

/**
 * HowItWorksSection
 * Vertical numbered step layout with a subtle connector line.
 */
export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="px-6 py-24 bg-white border-y border-neutral-100"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left: heading */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              How it works
            </p>
            <h2
              className="mb-6 text-4xl font-normal leading-snug text-neutral-900"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              From PDF to{" "}
              <span className="italic text-blue-600">mastery</span>
              <br />
              in four steps.
            </h2>
            <p className="text-base leading-relaxed text-neutral-500">
              No setup, no configuration, no prompt engineering. Upload once —
              and Cognify handles the rest so you can focus on understanding,
              not organizing.
            </p>

            {/* Decorative accent */}
            <div className="mt-10 h-px w-16 bg-blue-200" />
          </div>

          {/* Right: steps */}
          <div className="relative flex flex-col gap-0">
            {/* Vertical connector line */}
            <div className="absolute left-5 top-8 h-[calc(100%-64px)] w-px bg-neutral-100 lg:left-6" />

            {STEPS.map((step, index) => (
              <div key={step.number} className="relative flex gap-6 pb-10 last:pb-0">
                {/* Step number bubble */}
                <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-neutral-100 bg-white lg:h-12 lg:w-12">
                  <span className="text-xs font-bold tabular-nums text-blue-600">
                    {step.number}
                  </span>
                </div>

                {/* Step content */}
                <div className="pt-1.5">
                  <h3 className="mb-2 text-sm font-semibold text-neutral-800">
                    {step.title}
                  </h3>
                  <p className="mb-1.5 text-sm leading-relaxed text-neutral-500">
                    {step.description}
                  </p>
                  <p className="text-xs text-neutral-400">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}