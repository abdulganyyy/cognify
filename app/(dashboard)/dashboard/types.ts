import type { BookmarkType } from "@/types/database";

export type DocumentStatus = "ready" | "processing" | "uploading" | "uploaded" | "failed";

export interface Document {
  id: string;
  title: string;
  status: DocumentStatus;
  topicCount: number;
  flashcardCount: number;
  updatedAt: string;
  isBookmarked: boolean;
}

export interface LearningSession {
  documentId: string;
  title: string;
  progressPercent: number;
  lastAccessedAt: string;
  lastSection: "summary" | "topics" | "flashcards" | "chat";
  topicCount: number;
  flashcardCount: number;
}

export interface BookmarkedItem {
  id: string;
  documentId: string;
  documentTitle: string;
  type: BookmarkType;
  label: string;
  savedAt: string;
}

export interface DashboardUser {
  name: string;
  email: string;
  avatarUrl?: string;
}
