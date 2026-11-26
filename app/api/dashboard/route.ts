import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/guards";
import { listUserDocuments } from "@/lib/db/documents";
import { handleApiError } from "@/lib/utils/errors";
import type { BookmarkRow, ProfileRow } from "@/types/database";
import type { BookmarkItemView, ContinueLearningItem } from "@/types/domain";

export async function GET() {
  try {
    const { supabase, user } = await requireApiUser();

    const [profileRes, documents, bookmarksRes, chatSessionsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      listUserDocuments(supabase, user.id),
      supabase
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
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("chat_sessions")
        .select("document_id, last_message_at")
        .eq("user_id", user.id),
    ]);

    const profile = profileRes.data as ProfileRow | null;

    const chatSessionDocs = new Set(
      (chatSessionsRes.data ?? [])
        .filter((s) => s.last_message_at)
        .map((s) => s.document_id as string)
    );

    const readyDocs = documents.filter((d) => d.status === "ready");
    const sortedContinue = [...readyDocs].sort((a, b) => {
      const aTime = new Date(a.lastOpenedAt ?? a.updatedAt).getTime();
      const bTime = new Date(b.lastOpenedAt ?? b.updatedAt).getTime();
      return bTime - aTime;
    });

    const continueLearning: ContinueLearningItem[] = sortedContinue
      .slice(0, 2)
      .map((doc) => {
        const hasChat = chatSessionDocs.has(doc.id);
        const lastSection: ContinueLearningItem["lastSection"] = hasChat
          ? "chat"
          : doc.flashcardCount > 0
            ? "flashcards"
            : doc.topicCount > 0
              ? "topics"
              : "summary";
        const progressPercent = hasChat ? 80 : doc.flashcardCount > 0 ? 55 : 30;

        return {
          documentId: doc.id,
          title: doc.title,
          lastAccessedAt: doc.lastOpenedAt ?? doc.updatedAt,
          lastSection,
          progressPercent,
          topicCount: doc.topicCount,
          flashcardCount: doc.flashcardCount,
        };
      });

    type JoinedBookmark = BookmarkRow & {
      documents?: { title: string } | null;
      document_topics?: { name: string } | null;
      flashcards?: { question: string } | null;
      document_sections?: { title: string | null; section_index: number } | null;
    };

    const bookmarks: BookmarkItemView[] = ((bookmarksRes.data ?? []) as JoinedBookmark[]).map(
      (bm) => {
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
      }
    );

    return NextResponse.json({
      user: {
        id: user.id,
        name:
          profile?.full_name ||
          (typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : null) ||
          user.email?.split("@")[0] ||
          "Pengguna",
        email: user.email ?? "",
        avatarUrl: profile?.avatar_url ?? null,
      },
      documents,
      continueLearning,
      bookmarks,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
