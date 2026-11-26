import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/guards";
import { getOwnedDocumentOrThrow } from "@/lib/db/documents";
import { AppError, handleApiError } from "@/lib/utils/errors";
import { toggleBookmarkSchema } from "@/lib/validations/document";
import type { BookmarkRow } from "@/types/database";
import type { BookmarkItemView } from "@/types/domain";

export async function GET() {
  try {
    const { supabase, user } = await requireApiUser();
    const { data, error } = await supabase
      .from("bookmarks")
      .select(
        `
        *,
        documents:document_id ( title ),
        document_topics:topic_id ( name ),
        flashcards:flashcard_id ( question ),
        document_sections:section_id ( title, section_index )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError("Gagal memuat daftar bookmark.", 500, "BOOKMARKS_FETCH_ERROR");
    }

    type JoinedBookmark = BookmarkRow & {
      documents?: { title: string } | null;
      document_topics?: { name: string } | null;
      flashcards?: { question: string } | null;
      document_sections?: { title: string | null; section_index: number } | null;
    };

    const bookmarks: BookmarkItemView[] = ((data ?? []) as JoinedBookmark[]).map((bm) => {
      let label = bm.documents?.title ?? "Dokumen";
      if (bm.bookmark_type === "topic" && bm.document_topics?.name) {
        label = bm.document_topics.name;
      } else if (bm.bookmark_type === "flashcard" && bm.flashcards?.question) {
        label = bm.flashcards.question;
      } else if (bm.bookmark_type === "section" && bm.document_sections) {
        label =
          bm.document_sections.title ||
          `Bagian ${bm.document_sections.section_index}`;
      } else if (bm.bookmark_type === "summary") {
        label = `Ringkasan — ${bm.documents?.title ?? "Dokumen"}`;
      } else if (bm.highlighted_text) {
        label = bm.highlighted_text;
      }

      return {
        id: bm.id,
        documentId: bm.document_id,
        documentTitle: bm.documents?.title ?? "Dokumen",
        type: bm.bookmark_type,
        label,
        note: bm.note,
        topicId: bm.topic_id,
        flashcardId: bm.flashcard_id,
        sectionId: bm.section_id,
        savedAt: bm.created_at,
      };
    });

    return NextResponse.json({ bookmarks });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireApiUser();
    const body = await request.json();
    const parsed = toggleBookmarkSchema.parse(body);

    await getOwnedDocumentOrThrow(supabase, parsed.documentId, user.id);

    let existingQuery = supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("document_id", parsed.documentId)
      .eq("bookmark_type", parsed.bookmarkType);

    if (parsed.topicId) existingQuery = existingQuery.eq("topic_id", parsed.topicId);
    if (parsed.flashcardId)
      existingQuery = existingQuery.eq("flashcard_id", parsed.flashcardId);
    if (parsed.sectionId) existingQuery = existingQuery.eq("section_id", parsed.sectionId);

    const { data: existing } = await existingQuery.maybeSingle();

    if (existing) {
      await supabase.from("bookmarks").delete().eq("id", existing.id);
      return NextResponse.json({ bookmarked: false, id: existing.id });
    }

    const { data: created, error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: user.id,
        document_id: parsed.documentId,
        bookmark_type: parsed.bookmarkType,
        topic_id: parsed.topicId ?? null,
        flashcard_id: parsed.flashcardId ?? null,
        section_id: parsed.sectionId ?? null,
        highlighted_text: parsed.highlightedText ?? null,
        note: parsed.note ?? null,
      })
      .select("id")
      .single();

    if (error || !created) {
      throw new AppError(
        error?.message ?? "Gagal menyimpan bookmark.",
        500,
        "BOOKMARK_CREATE_ERROR"
      );
    }

    return NextResponse.json({ bookmarked: true, id: created.id }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { supabase, user } = await requireApiUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      throw new AppError("Parameter id bookmark wajib diisi.", 400, "MISSING_BOOKMARK_ID");
    }

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new AppError("Gagal menghapus bookmark.", 500, "BOOKMARK_DELETE_ERROR");
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
