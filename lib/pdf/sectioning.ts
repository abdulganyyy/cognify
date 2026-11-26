import { cleanExtractedText } from "@/lib/pdf/clean";
import { chunkText } from "@/lib/pdf/chunk";
import { estimateTokenCount } from "@/lib/utils/text";

export interface ParsedPage {
  pageNumber: number;
  text: string;
}

export interface DocumentSectionDraft {
  sectionIndex: number;
  title: string;
  content: string;
  pageStart: number;
  pageEnd: number;
  charStart: number;
  charEnd: number;
  tokenCount: number;
}

function inferSectionTitle(content: string, pageStart: number, pageEnd: number): string {
  const firstLine = content
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length >= 4 && line.length <= 90);

  if (firstLine && /^[A-Z0-9BabChapter\d]/.test(firstLine) && !firstLine.endsWith(".")) {
    return firstLine;
  }

  return pageStart === pageEnd
    ? `Halaman ${pageStart}`
    : `Halaman ${pageStart}–${pageEnd}`;
}

export function buildDocumentSections(pages: ParsedPage[]): DocumentSectionDraft[] {
  const sections: DocumentSectionDraft[] = [];
  let globalCharOffset = 0;
  let bufferText = "";
  let bufferPageStart: number | null = null;
  let bufferPageEnd = 1;

  const flushBuffer = () => {
    const cleaned = cleanExtractedText(bufferText);
    if (!cleaned || bufferPageStart === null) return;

    const chunks = chunkText(cleaned, 2400, 150);
    for (const chunk of chunks) {
      const charStart = globalCharOffset + chunk.charStart;
      const charEnd = globalCharOffset + chunk.charEnd;
      sections.push({
        sectionIndex: sections.length + 1,
        title: inferSectionTitle(chunk.content, bufferPageStart, bufferPageEnd),
        content: chunk.content,
        pageStart: bufferPageStart,
        pageEnd: bufferPageEnd,
        charStart,
        charEnd,
        tokenCount: estimateTokenCount(chunk.content),
      });
    }

    globalCharOffset += cleaned.length + 2;
    bufferText = "";
    bufferPageStart = null;
  };

  for (const page of pages) {
    const pageText = cleanExtractedText(page.text);
    if (!pageText) continue;

    if (bufferPageStart === null) {
      bufferPageStart = page.pageNumber;
    }
    bufferPageEnd = page.pageNumber;
    bufferText = bufferText ? `${bufferText}\n\n${pageText}` : pageText;

    if (bufferText.length >= 2200) {
      flushBuffer();
    }
  }

  flushBuffer();

  return sections;
}
