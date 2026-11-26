import { describe, expect, it } from "vitest";
import { selectRelevantSections } from "@/lib/ai/qa";

const SAMPLE_SECTIONS = [
  {
    id: "sec-1",
    sectionIndex: 1,
    title: "Pendahuluan Basis Data",
    content: "Basis data relasional menyimpan data dalam bentuk tabel dan relasi.",
  },
  {
    id: "sec-2",
    sectionIndex: 2,
    title: "Normalisasi 3NF",
    content: "Bentuk normal ketiga atau 3NF menghilangkan ketergantungan transitif antar atribut.",
  },
  {
    id: "sec-3",
    sectionIndex: 3,
    title: "Indeks B-Tree",
    content: "Struktur B-Tree mempercepat pencarian query pada kolom yang sering difilter.",
  },
];

describe("selectRelevantSections", () => {
  it("ranks matching sections highest based on title and content keywords", () => {
    const result = selectRelevantSections(
      "Apa itu normalisasi 3NF dan ketergantungan transitif?",
      SAMPLE_SECTIONS,
      2
    );

    expect(result.length).toBe(1);
    expect(result[0]?.id).toBe("sec-2");
  });

  it("falls back to initial sections when no tokens match", () => {
    const result = selectRelevantSections("kucing terbang luar angkasa", SAMPLE_SECTIONS, 2);

    expect(result.map((s) => s.id)).toEqual(["sec-1", "sec-2"]);
  });
});
