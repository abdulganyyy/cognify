import type { SupabaseClient } from "@supabase/supabase-js";
import { generateDocumentFlashcards } from "@/lib/ai/flashcards";
import { generateDocumentSummary } from "@/lib/ai/summarizer";
import { generateDocumentTopics } from "@/lib/ai/topics";
import { getOwnedSections } from "@/lib/db/documents";
import { parsePdfBuffer } from "@/lib/pdf/parse";
import { buildDocumentSections } from "@/lib/pdf/sectioning";
import { downloadDocumentPdfBuffer } from "@/lib/storage/documents";
import { AppError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";
import type { DocumentRow, DocumentSectionRow } from "@/types/database";

export const STALE_PROCESSING_MS = 3 * 60 * 1000;

export function isProcessingLockActive(doc: Pick<DocumentRow, "status" | "updated_at">): boolean {
  if (doc.status !== "processing") return false;
  const updatedMs = new Date(doc.updated_at).getTime();
  if (Number.isNaN(updatedMs)) return false;
  return Date.now() - updatedMs < STALE_PROCESSING_MS;
}

function mapSectionId(
  sections: Pick<DocumentSectionRow, "id" | "section_index">[],
  sectionNumber?: number
): string | null {
  if (!sectionNumber) return null;
  const found = sections.find((s) => s.section_index === sectionNumber);
  return found?.id ?? null;
}

export async function runSummaryGeneration(
  supabase: SupabaseClient,
  doc: Pick<DocumentRow, "id" | "title" | "raw_text">
) {
  await supabase
    .from("documents")
    .update({ summary_status: "processing" })
    .eq("id", doc.id);

  try {
    const text = doc.raw_text?.trim();
    if (!text) {
      throw new AppError("Teks dokumen belum tersedia untuk diringkas.", 400, "NO_TEXT");
    }

    const generated = await generateDocumentSummary({
      title: doc.title,
      text,
    });

    const { data: existingSummaries } = await supabase
      .from("document_summaries")
      .select("version")
      .eq("document_id", doc.id)
      .order("version", { ascending: false })
      .limit(1);

    const nextVersion = (existingSummaries?.[0]?.version ?? 0) + 1;

    await supabase
      .from("document_summaries")
      .update({ is_active: false })
      .eq("document_id", doc.id)
      .eq("is_active", true);

    const { error: insertError } = await supabase.from("document_summaries").insert([
      {
        document_id: doc.id,
        summary_type: "full",
        content: generated.fullSummary,
        language: "id",
        model_name: generated.modelName,
        version: nextVersion,
        is_active: true,
      },
      {
        document_id: doc.id,
        summary_type: "short",
        content: generated.shortSummary,
        language: "id",
        model_name: generated.modelName,
        version: nextVersion,
        is_active: true,
      },
    ]);

    if (insertError) throw insertError;

    await supabase
      .from("documents")
      .update({ summary_status: "ready" })
      .eq("id", doc.id);

    return generated;
  } catch (error) {
    await supabase
      .from("documents")
      .update({ summary_status: "failed" })
      .eq("id", doc.id);
    throw error;
  }
}

export async function runTopicsGeneration(
  supabase: SupabaseClient,
  doc: Pick<DocumentRow, "id" | "title">,
  sections?: DocumentSectionRow[]
) {
  await supabase
    .from("documents")
    .update({ topic_status: "processing" })
    .eq("id", doc.id);

  try {
    const docSections = sections ?? (await getOwnedSections(supabase, doc.id));
    if (docSections.length === 0) {
      throw new AppError("Bagian dokumen belum tersedia.", 400, "NO_SECTIONS");
    }

    const generated = await generateDocumentTopics({
      title: doc.title,
      sections: docSections.map((s) => ({
        sectionIndex: s.section_index,
        title: s.title,
        content: s.content,
      })),
    });

    await supabase.from("document_topics").delete().eq("document_id", doc.id);

    const { data: inserted, error: insertError } = await supabase
      .from("document_topics")
      .insert(
        generated.map((topic) => ({
          document_id: doc.id,
          section_id: mapSectionId(docSections, topic.sectionNumber),
          name: topic.name,
          description: topic.description,
          topic_order: topic.topicOrder,
          importance_score: topic.importanceScore,
        }))
      )
      .select("*");

    if (insertError) throw insertError;

    await supabase
      .from("documents")
      .update({ topic_status: "ready" })
      .eq("id", doc.id);

    return inserted ?? [];
  } catch (error) {
    await supabase
      .from("documents")
      .update({ topic_status: "failed" })
      .eq("id", doc.id);
    throw error;
  }
}

export async function runFlashcardsGeneration(
  supabase: SupabaseClient,
  doc: Pick<DocumentRow, "id" | "title">,
  sections?: DocumentSectionRow[]
) {
  await supabase
    .from("documents")
    .update({ flashcard_status: "processing" })
    .eq("id", doc.id);

  try {
    const docSections = sections ?? (await getOwnedSections(supabase, doc.id));
    if (docSections.length === 0) {
      throw new AppError("Bagian dokumen belum tersedia.", 400, "NO_SECTIONS");
    }

    const generated = await generateDocumentFlashcards({
      title: doc.title,
      sections: docSections.map((s) => ({
        sectionIndex: s.section_index,
        title: s.title,
        content: s.content,
      })),
    });

    await supabase
      .from("flashcards")
      .delete()
      .eq("document_id", doc.id)
      .eq("created_by", "ai");

    const { data: inserted, error: insertError } = await supabase
      .from("flashcards")
      .insert(
        generated.map((card) => ({
          document_id: doc.id,
          section_id: mapSectionId(docSections, card.sectionNumber),
          question: card.question,
          answer: card.answer,
          card_order: card.cardOrder,
          difficulty: card.difficulty,
          source_excerpt: card.sourceExcerpt,
          created_by: "ai" as const,
        }))
      )
      .select("*");

    if (insertError) throw insertError;

    await supabase
      .from("documents")
      .update({ flashcard_status: "ready" })
      .eq("id", doc.id);

    return inserted ?? [];
  } catch (error) {
    await supabase
      .from("documents")
      .update({ flashcard_status: "failed" })
      .eq("id", doc.id);
    throw error;
  }
}

export async function processFullDocumentPipeline(
  supabase: SupabaseClient,
  doc: DocumentRow
) {
  if (isProcessingLockActive(doc)) {
    throw new AppError(
      "Dokumen ini masih dalam proses analisis. Mohon tunggu sebentar.",
      409,
      "DOCUMENT_ALREADY_PROCESSING"
    );
  }

  await supabase
    .from("documents")
    .update({
      status: "processing",
      processing_error: null,
      summary_status: "pending",
      topic_status: "pending",
      flashcard_status: "pending",
    })
    .eq("id", doc.id);

  try {
    const pdfBuffer = await downloadDocumentPdfBuffer(doc.storage_path);
    const parsed = await parsePdfBuffer(pdfBuffer);
    const sectionDrafts = buildDocumentSections(parsed.pages);

    if (sectionDrafts.length === 0) {
      throw new AppError(
        "Tidak ada bagian teks yang valid di dalam PDF.",
        422,
        "EMPTY_SECTIONS"
      );
    }

    await supabase
      .from("documents")
      .update({
        page_count: parsed.pageCount,
        raw_text: parsed.rawText,
        text_extracted: true,
      })
      .eq("id", doc.id);

    await supabase.from("document_sections").delete().eq("document_id", doc.id);

    const { data: insertedSections, error: sectionsError } = await supabase
      .from("document_sections")
      .insert(
        sectionDrafts.map((section) => ({
          document_id: doc.id,
          section_index: section.sectionIndex,
          title: section.title,
          content: section.content,
          page_start: section.pageStart,
          page_end: section.pageEnd,
          char_start: section.charStart,
          char_end: section.charEnd,
          token_count: section.tokenCount,
          embedding_status: "ready" as const,
        }))
      )
      .select("*");

    if (sectionsError || !insertedSections) {
      throw new AppError(
        sectionsError?.message ?? "Gagal menyimpan potongan dokumen.",
        500,
        "SECTIONS_INSERT_ERROR"
      );
    }

    const sections = insertedSections as DocumentSectionRow[];
    const docWithText = { ...doc, raw_text: parsed.rawText };

    // Jalankan sekuensial agar aman terhadap rate-limit model gratis OpenRouter
    const tasks = [
      () => runSummaryGeneration(supabase, docWithText),
      () => runTopicsGeneration(supabase, docWithText, sections),
      () => runFlashcardsGeneration(supabase, docWithText, sections),
    ];

    const errors: string[] = [];
    let successCount = 0;

    for (const runTask of tasks) {
      try {
        await runTask();
        successCount += 1;
      } catch (stepErr) {
        const message =
          stepErr instanceof Error ? stepErr.message : "Gagal memproses AI";
        errors.push(message);
        logger.warn({ err: message, documentId: doc.id }, "Pipeline step failed");
      }
    }

    const allFailed = successCount === 0;

    await supabase
      .from("documents")
      .update({
        status: allFailed ? "failed" : "ready",
        processing_error: errors.length > 0 ? errors.join(" | ") : null,
      })
      .eq("id", doc.id);

    if (allFailed) {
      throw new AppError(errors[0] || "Pemrosesan AI gagal.", 500, "AI_PIPELINE_FAILED");
    }

    return {
      status: "ready" as const,
      warnings: errors,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kegagalan saat memproses dokumen.";
    logger.error({ err: error, documentId: doc.id }, "Document processing failed");

    await supabase
      .from("documents")
      .update({
        status: "failed",
        processing_error: message,
      })
      .eq("id", doc.id);

    throw error;
  }
}
