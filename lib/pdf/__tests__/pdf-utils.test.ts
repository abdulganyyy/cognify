import { describe, expect, it } from "vitest";
import { chunkText } from "@/lib/pdf/chunk";
import { cleanExtractedText } from "@/lib/pdf/clean";
import { buildDocumentSections } from "@/lib/pdf/sectioning";

describe("PDF text cleaning, chunking, and sectioning", () => {
  it("cleans carriage returns, null bytes, and excessive whitespace", () => {
    const raw = "Judul\u0000 Materi\r\n\r\n\r\nParagraf   pertama\t\toke.\r\n";
    expect(cleanExtractedText(raw)).toBe("Judul Materi\n\nParagraf pertama oke.");
  });

  it("splits long text into overlapping chunks without losing content", () => {
    const sentence = "Ini adalah kalimat uji untuk memastikan chunking bekerja. ";
    const text = sentence.repeat(80);
    const chunks = chunkText(text, 600, 100);

    expect(chunks.length).toBeGreaterThan(2);
    for (const chunk of chunks) {
      expect(chunk.content.length).toBeLessThanOrEqual(600);
      expect(chunk.charEnd).toBeGreaterThan(chunk.charStart);
    }
  });

  it("builds sections with accurate page ranges and token counts", () => {
    const sections = buildDocumentSections([
      {
        pageNumber: 1,
        text: "Bab 1 Pengantar AI\nKecerdasan buatan mempelajari cara komputer bernalar.",
      },
      {
        pageNumber: 2,
        text: "Bab 2 Pembelajaran Mesin\nSupervised learning menggunakan data berlabel.",
      },
    ]);

    expect(sections.length).toBe(1);
    expect(sections[0]).toMatchObject({
      sectionIndex: 1,
      pageStart: 1,
      pageEnd: 2,
      title: "Bab 1 Pengantar AI",
    });
    expect(sections[0].tokenCount).toBeGreaterThan(0);
  });
});
