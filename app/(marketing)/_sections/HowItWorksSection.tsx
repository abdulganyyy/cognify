const STEPS = [
  {
    number: "01",
    title: "Unggah file PDF",
    description:
      "Seret dan lepas dokumen kuliah, bab buku teks, atau catatan akademik. Maksimal 10 MB.",
    detail: "Mendukung dokumen PDF standar berbasis teks.",
  },
  {
    number: "02",
    title: "AI memproses dokumenmu",
    description:
      "Cognify mengekstrak, membersihkan, dan memecah materi menjadi bagian-bagian terstruktur dalam hitungan detik.",
    detail: "Seluruh pemrosesan berjalan aman di server kami.",
  },
  {
    number: "03",
    title: "Jelajahi paket belajarmu",
    description:
      "Dokumenmu langsung berubah menjadi ringkasan, peta topik, dek flashcard, dan Tutor AI yang siap diajak berdiskusi.",
    detail: "Tanpa perlu merangkai prompt. Langsung buka dan pelajari.",
  },
  {
    number: "04",
    title: "Pelajari, simpan, dan ulangi",
    description:
      "Kembali kapan saja. Seluruh dokumen, bookmark, dan riwayat percakapanmu tersimpan rapi.",
    detail: "Tandai topik penting, latih flashcard, dan ajukan pertanyaan lanjutan.",
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
              Cara Kerja
            </p>
            <h2 className="mb-6 font-serif text-4xl font-normal leading-snug text-neutral-900">
              Dari PDF hingga{" "}
              <span className="italic text-blue-600">paham tuntas</span>
              <br />
              dalam empat langkah.
            </h2>
            <p className="text-base leading-relaxed text-neutral-500">
              Tanpa konfigurasi rumit atau prompt engineering. Cukup unggah sekali —
              Cognify menyiapkan materi belajarmu agar kamu fokus memahami konsep.
            </p>

            {/* Decorative accent */}
            <div className="mt-10 h-px w-16 bg-blue-200" />
          </div>

          {/* Right: steps */}
          <div className="relative flex flex-col gap-0">
            {/* Vertical connector line */}
            <div className="absolute left-5 top-8 h-[calc(100%-64px)] w-px bg-neutral-100 lg:left-6" />

            {STEPS.map((step) => (
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