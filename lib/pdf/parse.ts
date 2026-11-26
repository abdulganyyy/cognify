import { PDFParse } from "pdf-parse";
import { cleanExtractedText } from "@/lib/pdf/clean";
import type { ParsedPage } from "@/lib/pdf/sectioning";
import { AppError } from "@/lib/utils/errors";

export interface ParsedPdfResult {
  pageCount: number;
  rawText: string;
  pages: ParsedPage[];
}

export async function parsePdfBuffer(buffer: Buffer): Promise<ParsedPdfResult> {
  const parser = new PDFParse({ data: buffer });

  try {
    const textResult = await parser.getText();
    const pages: ParsedPage[] = (textResult.pages ?? []).map((page) => ({
      pageNumber: page.num,
      text: cleanExtractedText(page.text ?? ""),
    }));

    const combinedText = cleanExtractedText(
      textResult.text || pages.map((p) => p.text).join("\n\n")
    );

    if (!combinedText || combinedText.length < 20) {
      throw new AppError(
        "PDF tidak memiliki teks yang dapat diekstrak. Pastikan PDF bukan hasil pindaian gambar tanpa teks.",
        422,
        "PDF_NO_EXTRACTABLE_TEXT"
      );
    }

    return {
      pageCount: textResult.total || pages.length || 1,
      rawText: combinedText,
      pages:
        pages.length > 0
          ? pages
          : [{ pageNumber: 1, text: combinedText }],
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      error instanceof Error
        ? `Gagal membaca file PDF: ${error.message}`
        : "Gagal membaca file PDF.",
      422,
      "PDF_PARSE_ERROR"
    );
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}
