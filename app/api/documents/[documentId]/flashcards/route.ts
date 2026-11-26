import { NextResponse } from "next/server";
import { runFlashcardsGeneration } from "@/lib/ai/pipeline";
import { requireApiUser } from "@/lib/auth/guards";
import { getOwnedDocumentOrThrow } from "@/lib/db/documents";
import { AppError, handleApiError } from "@/lib/utils/errors";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { createFlashcardSchema } from "@/lib/validations/document";

export const maxDuration = 60;

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    const { supabase, user } = await requireApiUser();
    await getOwnedDocumentOrThrow(supabase, documentId, user.id);

    const { data } = await supabase
      .from("flashcards")
      .select("*")
      .eq("document_id", documentId)
      .order("card_order", { ascending: true });

    return NextResponse.json({ flashcards: data ?? [] });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    const { supabase, user } = await requireApiUser();
    const doc = await getOwnedDocumentOrThrow(supabase, documentId, user.id);

    const body = await request.json().catch(() => ({ action: "regenerate" }));
    const parsed = createFlashcardSchema.parse(body);

    if (parsed.action === "regenerate") {
      enforceRateLimit(`ai:${user.id}`, 15, 60_000);
      const flashcards = await runFlashcardsGeneration(supabase, doc);
      return NextResponse.json({ flashcards });
    }

    if (!parsed.question || !parsed.answer) {
      throw new AppError(
        "Pertanyaan dan jawaban wajib diisi untuk membuat flashcard.",
        400,
        "MISSING_FLASHCARD_FIELDS"
      );
    }

    const { data: lastCard } = await supabase
      .from("flashcards")
      .select("card_order")
      .eq("document_id", documentId)
      .order("card_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: created, error } = await supabase
      .from("flashcards")
      .insert({
        document_id: documentId,
        question: parsed.question,
        answer: parsed.answer,
        difficulty: parsed.difficulty ?? "medium",
        card_order: (lastCard?.card_order ?? 0) + 1,
        created_by: "user",
      })
      .select("*")
      .single();

    if (error || !created) {
      throw new AppError("Gagal menambah flashcard.", 500, "FLASHCARD_CREATE_ERROR");
    }

    return NextResponse.json({ flashcard: created }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
