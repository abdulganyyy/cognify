export type DocumentStatus = "uploaded" | "processing" | "ready" | "failed";
export type ProcessingStatus = "pending" | "processing" | "ready" | "failed";
export type SummaryType = "full" | "short" | "section";
export type FlashcardCreator = "ai" | "user";
export type ChatRole = "user" | "assistant" | "system";
export type ChatMessageStatus = "pending" | "completed" | "failed";
export type BookmarkType =
  | "document"
  | "summary"
  | "section"
  | "topic"
  | "flashcard"
  | "text";

export interface ProfileRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  preferred_language: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentRow {
  id: string;
  user_id: string;
  title: string;
  original_file_name: string;
  storage_path: string;
  file_size_bytes: number;
  mime_type: string;
  page_count: number | null;
  status: DocumentStatus;
  processing_error: string | null;
  language: string | null;
  raw_text: string | null;
  text_extracted: boolean;
  summary_status: ProcessingStatus;
  flashcard_status: ProcessingStatus;
  topic_status: ProcessingStatus;
  last_opened_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentSectionRow {
  id: string;
  document_id: string;
  section_index: number;
  title: string | null;
  content: string;
  page_start: number | null;
  page_end: number | null;
  char_start: number | null;
  char_end: number | null;
  token_count: number | null;
  embedding_status: ProcessingStatus;
  created_at: string;
  updated_at: string;
}

export interface DocumentSummaryRow {
  id: string;
  document_id: string;
  section_id: string | null;
  summary_type: SummaryType;
  content: string;
  language: string | null;
  model_name: string | null;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentTopicRow {
  id: string;
  document_id: string;
  section_id: string | null;
  name: string;
  description: string | null;
  topic_order: number;
  importance_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface FlashcardRow {
  id: string;
  document_id: string;
  section_id: string | null;
  question: string;
  answer: string;
  card_order: number;
  difficulty: string | null;
  source_excerpt: string | null;
  created_by: FlashcardCreator;
  created_at: string;
  updated_at: string;
}

export interface ChatSessionRow {
  id: string;
  user_id: string;
  document_id: string;
  title: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRow {
  id: string;
  session_id: string;
  role: ChatRole;
  content: string;
  source_section_ids: string[] | null;
  status: ChatMessageStatus;
  error_message: string | null;
  created_at: string;
}

export interface BookmarkRow {
  id: string;
  user_id: string;
  document_id: string;
  bookmark_type: BookmarkType;
  section_id: string | null;
  topic_id: string | null;
  flashcard_id: string | null;
  highlighted_text: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogRow {
  id: string;
  user_id: string;
  document_id: string | null;
  activity_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
