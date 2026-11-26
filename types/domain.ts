import type {
  BookmarkType,
  DocumentStatus,
  FlashcardCreator,
  ProcessingStatus,
} from "@/types/database";

export interface UserProfileSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface DocumentListItem {
  id: string;
  title: string;
  originalFileName: string;
  fileSizeBytes: number;
  pageCount: number | null;
  status: DocumentStatus;
  summaryStatus: ProcessingStatus;
  topicStatus: ProcessingStatus;
  flashcardStatus: ProcessingStatus;
  processingError: string | null;
  shortSummary: string | null;
  topicCount: number;
  flashcardCount: number;
  topics: Array<{ id: string; label: string }>;
  isBookmarked: boolean;
  lastOpenedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDetail {
  id: string;
  title: string;
  originalFileName: string;
  fileSizeBytes: number;
  pageCount: number | null;
  status: DocumentStatus;
  summaryStatus: ProcessingStatus;
  topicStatus: ProcessingStatus;
  flashcardStatus: ProcessingStatus;
  processingError: string | null;
  textExtracted: boolean;
  isBookmarked: boolean;
  lastOpenedAt: string | null;
  createdAt: string;
  updatedAt: string;
  fullSummary: string | null;
  shortSummary: string | null;
  topics: Array<{
    id: string;
    name: string;
    description: string | null;
    topicOrder: number;
    importanceScore: number | null;
    sectionId: string | null;
    isBookmarked: boolean;
  }>;
  flashcards: Array<{
    id: string;
    question: string;
    answer: string;
    difficulty: string | null;
    sourceExcerpt: string | null;
    cardOrder: number;
    createdBy: FlashcardCreator;
    sectionId: string | null;
    isBookmarked: boolean;
  }>;
  sections: Array<{
    id: string;
    sectionIndex: number;
    title: string | null;
    content: string;
    pageStart: number | null;
    pageEnd: number | null;
  }>;
}

export interface ContinueLearningItem {
  documentId: string;
  title: string;
  lastAccessedAt: string;
  lastSection: "summary" | "topics" | "flashcards" | "chat";
  progressPercent: number;
  topicCount: number;
  flashcardCount: number;
}

export interface BookmarkItemView {
  id: string;
  documentId: string;
  documentTitle: string;
  type: BookmarkType;
  label: string;
  note: string | null;
  topicId: string | null;
  flashcardId: string | null;
  sectionId: string | null;
  savedAt: string;
}

export interface ChatMessageView {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  status: "pending" | "completed" | "failed";
  errorMessage: string | null;
  sourceSections: Array<{
    id: string;
    sectionIndex: number;
    title: string | null;
    excerpt: string;
  }>;
  createdAt: string;
}
