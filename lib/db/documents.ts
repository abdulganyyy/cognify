import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/utils/errors";
import type {
  BookmarkRow,
  DocumentRow,
  DocumentSectionRow,
  DocumentSummaryRow,
  DocumentTopicRow,
  FlashcardRow,
} from "@/types/database";
import type { DocumentDetail, DocumentListItem } from "@/types/domain";

export async function getOwnedDocumentOrThrow(
  supabase: SupabaseClient,
  documentId: string,
  userId: string
): Promise<DocumentRow> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new AppError("Dokumen tidak ditemukan.", 404, "DOCUMENT_NOT_FOUND");
  }

  return data as DocumentRow;
}

export async function getOwnedSections(
  supabase: SupabaseClient,
  documentId: string
): Promise<DocumentSectionRow[]> {
  const { data, error } = await supabase
    .from("document_sections")
    .select("*")
    .eq("document_id", documentId)
    .order("section_index", { ascending: true });

  if (error) {
    throw new AppError("Gagal memuat bagian dokumen.", 500, "SECTIONS_FETCH_ERROR");
  }

  return (data ?? []) as DocumentSectionRow[];
}

export async function listUserDocuments(
  supabase: SupabaseClient,
  userId: string,
  search?: string
): Promise<DocumentListItem[]> {
  let query = supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (search?.trim()) {
    query = query.ilike("title", `%${search.trim()}%`);
  }

  const { data: docsData, error: docsError } = await query;
  if (docsError) {
    throw new AppError("Gagal memuat daftar dokumen.", 500, "DOCUMENTS_FETCH_ERROR");
  }

  const docs = (docsData ?? []) as DocumentRow[];
  if (docs.length === 0) return [];

  const docIds = docs.map((d) => d.id);

  const [summariesRes, topicsRes, flashcardsRes, bookmarksRes] = await Promise.all([
    supabase
      .from("document_summaries")
      .select("document_id, summary_type, content, is_active")
      .in("document_id", docIds)
      .eq("is_active", true),
    supabase
      .from("document_topics")
      .select("id, document_id, name, topic_order")
      .in("document_id", docIds)
      .order("topic_order", { ascending: true }),
    supabase
      .from("flashcards")
      .select("id, document_id")
      .in("document_id", docIds),
    supabase
      .from("bookmarks")
      .select("document_id, bookmark_type")
      .eq("user_id", userId)
      .eq("bookmark_type", "document")
      .in("document_id", docIds),
  ]);

  const summaryMap = new Map<string, string>();
  for (const row of (summariesRes.data ?? []) as Pick<
    DocumentSummaryRow,
    "document_id" | "summary_type" | "content"
  >[]) {
    if (row.summary_type === "short") {
      summaryMap.set(row.document_id, row.content);
    } else if (!summaryMap.has(row.document_id)) {
      summaryMap.set(row.document_id, row.content.slice(0, 180));
    }
  }

  const topicsMap = new Map<string, Array<{ id: string; label: string }>>();
  for (const row of (topicsRes.data ?? []) as Pick<
    DocumentTopicRow,
    "id" | "document_id" | "name"
  >[]) {
    const list = topicsMap.get(row.document_id) ?? [];
    list.push({ id: row.id, label: row.name });
    topicsMap.set(row.document_id, list);
  }

  const flashcardCountMap = new Map<string, number>();
  for (const row of (flashcardsRes.data ?? []) as Pick<FlashcardRow, "id" | "document_id">[]) {
    flashcardCountMap.set(row.document_id, (flashcardCountMap.get(row.document_id) ?? 0) + 1);
  }

  const bookmarkedDocs = new Set<string>();
  for (const row of (bookmarksRes.data ?? []) as Pick<BookmarkRow, "document_id">[]) {
    bookmarkedDocs.add(row.document_id);
  }

  return docs.map((doc) => {
    const topics = topicsMap.get(doc.id) ?? [];
    return {
      id: doc.id,
      title: doc.title,
      originalFileName: doc.original_file_name,
      fileSizeBytes: doc.file_size_bytes,
      pageCount: doc.page_count,
      status: doc.status,
      summaryStatus: doc.summary_status,
      topicStatus: doc.topic_status,
      flashcardStatus: doc.flashcard_status,
      processingError: doc.processing_error,
      shortSummary: summaryMap.get(doc.id) ?? null,
      topicCount: topics.length,
      flashcardCount: flashcardCountMap.get(doc.id) ?? 0,
      topics,
      isBookmarked: bookmarkedDocs.has(doc.id),
      lastOpenedAt: doc.last_opened_at,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    };
  });
}

export async function getDocumentDetailView(
  supabase: SupabaseClient,
  documentId: string,
  userId: string
): Promise<DocumentDetail> {
  const doc = await getOwnedDocumentOrThrow(supabase, documentId, userId);

  const [summariesRes, topicsRes, flashcardsRes, sectionsRes, bookmarksRes] =
    await Promise.all([
      supabase
        .from("document_summaries")
        .select("*")
        .eq("document_id", documentId)
        .eq("is_active", true),
      supabase
        .from("document_topics")
        .select("*")
        .eq("document_id", documentId)
        .order("topic_order", { ascending: true }),
      supabase
        .from("flashcards")
        .select("*")
        .eq("document_id", documentId)
        .order("card_order", { ascending: true }),
      supabase
        .from("document_sections")
        .select("id, section_index, title, content, page_start, page_end")
        .eq("document_id", documentId)
        .order("section_index", { ascending: true }),
      supabase
        .from("bookmarks")
        .select("bookmark_type, topic_id, flashcard_id")
        .eq("user_id", userId)
        .eq("document_id", documentId),
    ]);

  const summaries = (summariesRes.data ?? []) as DocumentSummaryRow[];
  const fullSummary = summaries.find((s) => s.summary_type === "full")?.content ?? null;
  const shortSummary = summaries.find((s) => s.summary_type === "short")?.content ?? null;

  const bookmarks = (bookmarksRes.data ?? []) as Pick<
    BookmarkRow,
    "bookmark_type" | "topic_id" | "flashcard_id"
  >[];
  const isDocBookmarked = bookmarks.some((b) => b.bookmark_type === "document");
  const bookmarkedTopics = new Set(
    bookmarks.filter((b) => b.topic_id).map((b) => b.topic_id as string)
  );
  const bookmarkedFlashcards = new Set(
    bookmarks.filter((b) => b.flashcard_id).map((b) => b.flashcard_id as string)
  );

  return {
    id: doc.id,
    title: doc.title,
    originalFileName: doc.original_file_name,
    fileSizeBytes: doc.file_size_bytes,
    pageCount: doc.page_count,
    status: doc.status,
    summaryStatus: doc.summary_status,
    topicStatus: doc.topic_status,
    flashcardStatus: doc.flashcard_status,
    processingError: doc.processing_error,
    textExtracted: doc.text_extracted,
    isBookmarked: isDocBookmarked,
    lastOpenedAt: doc.last_opened_at,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
    fullSummary,
    shortSummary,
    topics: ((topicsRes.data ?? []) as DocumentTopicRow[]).map((topic) => ({
      id: topic.id,
      name: topic.name,
      description: topic.description,
      topicOrder: topic.topic_order,
      importanceScore: topic.importance_score ? Number(topic.importance_score) : null,
      sectionId: topic.section_id,
      isBookmarked: bookmarkedTopics.has(topic.id),
    })),
    flashcards: ((flashcardsRes.data ?? []) as FlashcardRow[]).map((card) => ({
      id: card.id,
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty,
      sourceExcerpt: card.source_excerpt,
      cardOrder: card.card_order,
      createdBy: card.created_by,
      sectionId: card.section_id,
      isBookmarked: bookmarkedFlashcards.has(card.id),
    })),
    sections: (sectionsRes.data ?? []).map((sec) => ({
      id: sec.id,
      sectionIndex: sec.section_index,
      title: sec.title,
      content: sec.content,
      pageStart: sec.page_start,
      pageEnd: sec.page_end,
    })),
  };
}

export async function logUserActivity(
  supabase: SupabaseClient,
  params: {
    userId: string;
    documentId?: string | null;
    activityType: string;
    metadata?: Record<string, unknown>;
  }
) {
  await supabase.from("activity_logs").insert({
    user_id: params.userId,
    document_id: params.documentId ?? null,
    activity_type: params.activityType,
    metadata: params.metadata ?? null,
  });
}
