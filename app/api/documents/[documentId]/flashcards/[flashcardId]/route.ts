import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/guards";
import { getOwnedDocumentOrThrow } from "@/lib/db/documents";
import { AppError, handleApiError } from "@/lib/utils/errors";
import { updateFlashcardSchema } from "@/lib/validations/document";

interface RouteContext {
  params: Promise<{ documentId: string; flashcardId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { documentId, flashcardId } = await context.params;
    const { supabase, user } = await requireApiUser();
    await getOwnedDocumentOrThrow(supabase, documentId, user.id);

    const body = await request.json();
    const parsed = updateFlashcardSchema.parse(body);

    const { data, error } = await supabase
      .from("flashcards")
      .update({
        ...(parsed.question !== undefined ? { question: parsed.question } : {}),
        ...(parsed.answer !== undefined ? { answer: parsed.answer } : {}),
        ...(parsed.difficulty !== undefined ? { difficulty: parsed.difficulty } : {}),
      })
      .eq("id", flashcardId)
      .eq("document_id", documentId)
      .select("*")
      .single();

    if (error || !data) {
      throw new AppError("Flashcard tidak ditemukan.", 404, "FLASHCARD_NOT_FOUND");
    }

    return NextResponse.json({ flashcard: data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { documentId, flashcardId } = await context.params;
    const { supabase, user } = await requireApiUser();
    await getOwnedDocumentOrThrow(supabase, documentId, user.id);

    const { error } = await supabase
      .from("flashcards")
      .delete()
      .eq("id", flashcardId)
      .eq("document_id", documentId);

    if (error) {
      throw new AppError("Gagal menghapus flashcard.", 500, "FLASHCARD_DELETE_ERROR");
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
