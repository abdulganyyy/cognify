import {
  FileText,
  MessageSquare,
  Layers,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";

/**
 * DashboardPreview
 *
 * Dashboard mockup yang dibangun sepenuhnya dari HTML + Tailwind.
 * Tidak menggunakan gambar. Merepresentasikan tampilan nyata aplikasi:
 * - Sidebar kiri: daftar dokumen
 * - Panel tengah: summary + topik
 * - Panel kanan: chat AI
 */
export function DashboardPreview() {
  return (
    <section id="preview" className="px-6 pb-24 pt-4">
      <div className="mx-auto max-w-6xl">
        {/* Section label */}
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Product Preview
          </p>
        </div>

        {/* Browser chrome wrapper */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-200/60">
          {/* Browser bar */}
          <div className="flex h-9 items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
              <div className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
              <div className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
            </div>
            <div className="mx-auto flex h-5 w-56 items-center gap-1.5 rounded-md bg-neutral-200/60 px-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
              <div className="h-1 flex-1 rounded-full bg-neutral-300" />
            </div>
          </div>

          {/* App layout */}
          <div className="flex h-[520px] md:h-[580px]">
            {/* ── Sidebar ─────────────────────────────────────── */}
            <div className="hidden w-[200px] flex-shrink-0 flex-col border-r border-neutral-100 bg-white md:flex">
              {/* Logo row */}
              <div className="flex h-11 items-center gap-2 border-b border-neutral-100 px-4">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600">
                  <BookOpen className="h-2.5 w-2.5 text-white" />
                </div>
                <span className="text-xs font-semibold text-neutral-800">Cognify</span>
              </div>

              {/* Upload button */}
              <div className="px-3 py-3">
                <div className="flex h-7 w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 text-[10px] font-medium text-white">
                  <span>+ Upload PDF</span>
                </div>
              </div>

              {/* Section label */}
              <p className="px-4 pb-1 text-[9px] font-semibold uppercase tracking-widest text-neutral-400">
                Documents
              </p>

              {/* Doc list */}
              <div className="flex-1 space-y-0.5 overflow-hidden px-2">
                {[
                  { title: "Calculus Vol. 2", active: true, status: "ready", topics: 12 },
                  { title: "Intro to ML", active: false, status: "processing", topics: 0 },
                  { title: "Data Structures", active: false, status: "ready", topics: 8 },
                  { title: "Linear Algebra", active: false, status: "ready", topics: 6 },
                ].map((doc) => (
                  <div
                    key={doc.title}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                      doc.active ? "bg-blue-50" : "hover:bg-neutral-50"
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded ${
                        doc.active ? "bg-blue-100" : "bg-neutral-100"
                      }`}
                    >
                      <FileText
                        className={`h-2.5 w-2.5 ${
                          doc.active ? "text-blue-500" : "text-neutral-400"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`truncate text-[10px] font-medium ${
                          doc.active ? "text-blue-700" : "text-neutral-600"
                        }`}
                      >
                        {doc.title}
                      </p>
                      <div className="flex items-center gap-1">
                        <span
                          className={`h-1 w-1 rounded-full ${
                            doc.status === "ready"
                              ? "bg-emerald-400"
                              : "bg-amber-400 animate-pulse"
                          }`}
                        />
                        <span className="text-[9px] text-neutral-400">
                          {doc.status === "ready"
                            ? `${doc.topics} topics`
                            : "Processing…"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* User area */}
              <div className="flex items-center gap-2 border-t border-neutral-100 px-3 py-2.5">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-semibold text-blue-700">
                  BS
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-medium text-neutral-700">
                    Budi Santoso
                  </p>
                  <p className="text-[9px] text-neutral-400">budi@student.id</p>
                </div>
              </div>
            </div>

            {/* ── Main Content ─────────────────────────────────── */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Topbar */}
              <div className="flex h-11 items-center border-b border-neutral-100 px-5">
                <p className="text-xs font-semibold text-neutral-800">
                  Calculus Vol. 2
                </p>
                <div className="ml-3 flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                  <span className="text-[9px] font-medium text-emerald-600">
                    Ready
                  </span>
                </div>
                <div className="ml-auto flex gap-2">
                  {["Summary", "Topics", "Flashcards", "Chat"].map((tab, i) => (
                    <span
                      key={tab}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                        i === 0
                          ? "bg-blue-50 text-blue-600"
                          : "text-neutral-400"
                      }`}
                    >
                      {tab}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Summary + Topics */}
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
                  {/* Summary card */}
                  <div className="rounded-xl border border-neutral-100 bg-white p-4">
                    <div className="mb-3 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-blue-500" />
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                        AI Summary
                      </p>
                    </div>
                    <div className="space-y-2">
                      {[
                        "w-full",
                        "w-[92%]",
                        "w-[85%]",
                        "w-full",
                        "w-[78%]",
                      ].map((w, i) => (
                        <div
                          key={i}
                          className={`h-2 rounded-full bg-neutral-100 ${w}`}
                        />
                      ))}
                    </div>
                    <div className="mt-4 space-y-2">
                      {["w-[88%]", "w-full", "w-[70%]"].map((w, i) => (
                        <div
                          key={i}
                          className={`h-2 rounded-full bg-neutral-100 ${w}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="rounded-xl border border-neutral-100 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Layers className="h-3 w-3 text-blue-500" />
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                          Key Topics
                        </p>
                      </div>
                      <span className="text-[9px] text-neutral-400">
                        12 topics
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Limits & Continuity",
                        "Derivatives",
                        "Chain Rule",
                        "Integration",
                        "Riemann Sums",
                        "Fundamental Theorem",
                        "Partial Derivatives",
                        "Series & Sequences",
                      ].map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[9px] font-medium text-neutral-600"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Flashcard preview */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                    <div className="mb-2 flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-blue-500" />
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">
                        Flashcards Ready
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-neutral-600">
                        24 cards generated from this document
                      </p>
                      <div className="flex items-center gap-0.5 text-[9px] font-medium text-blue-600">
                        Study now
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Chat Panel ─────────────────────────────────── */}
                <div className="hidden w-[220px] flex-shrink-0 flex-col border-l border-neutral-100 bg-neutral-50/50 lg:flex">
                  {/* Chat header */}
                  <div className="flex h-10 items-center gap-1.5 border-b border-neutral-100 px-4">
                    <MessageSquare className="h-3 w-3 text-blue-500" />
                    <p className="text-[10px] font-semibold text-neutral-700">
                      Ask AI
                    </p>
                    <span className="ml-auto rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-medium text-blue-600">
                      RAG
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="flex flex-1 flex-col gap-2.5 overflow-hidden p-3">
                    {/* User message */}
                    <div className="self-end rounded-xl rounded-tr-sm bg-blue-600 px-2.5 py-1.5 text-[10px] leading-relaxed text-white">
                      What is the chain rule used for?
                    </div>

                    {/* AI response */}
                    <div className="self-start rounded-xl rounded-tl-sm border border-neutral-200 bg-white px-2.5 py-2 text-[10px] leading-relaxed text-neutral-700">
                      The chain rule is used to differentiate composite functions. If{" "}
                      <span className="font-medium">y = f(g(x))</span>, then
                      dy/dx = f′(g(x)) · g′(x).
                    </div>

                    {/* User */}
                    <div className="self-end rounded-xl rounded-tr-sm bg-blue-600 px-2.5 py-1.5 text-[10px] leading-relaxed text-white">
                      Give me an example from chapter 3
                    </div>

                    {/* AI typing */}
                    <div className="flex self-start items-center gap-1 rounded-xl rounded-tl-sm border border-neutral-200 bg-white px-3 py-2">
                      <div className="flex gap-0.5">
                        {[0, 150, 300].map((delay) => (
                          <span
                            key={delay}
                            className="h-1 w-1 rounded-full bg-blue-400 animate-bounce"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Input bar */}
                  <div className="border-t border-neutral-100 p-2.5">
                    <div className="flex h-7 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2.5">
                      <div className="h-1.5 flex-1 rounded-full bg-neutral-200" />
                      <div className="flex h-4 w-4 items-center justify-center rounded bg-blue-600">
                        <ChevronRight className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Caption */}
        <p className="mt-5 text-center text-xs text-neutral-400">
          Everything you see is generated by AI from a single PDF upload.
        </p>
      </div>
    </section>
  );
}