// ─── Shared Types ─────────────────────────────────────────────────────────────

export type DocumentStatus = "ready" | "processing" | "uploading" | "failed";

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
  /** Which section was last active */
  lastSection: "summary" | "topics" | "flashcards" | "chat";
  topicCount: number;
  flashcardCount: number;
}

export interface BookmarkedItem {
  id: string;
  documentId: string;
  documentTitle: string;
  type: "topic" | "flashcard" | "summary";
  label: string;
  savedAt: string;
}

export interface DashboardUser {
  name: string;
  email: string;
  avatarUrl?: string;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

export const DUMMY_USER: DashboardUser = {
  name: "Budi Santoso",
  email: "budi@student.ac.id",
};

export const DUMMY_DOCUMENTS: Document[] = [
  {
    id: "doc-1",
    title: "Kalkulus Diferensial & Integral",
    status: "ready",
    topicCount: 12,
    flashcardCount: 24,
    updatedAt: "2 jam lalu",
    isBookmarked: true,
  },
  {
    id: "doc-2",
    title: "Pengantar Machine Learning",
    status: "processing",
    topicCount: 0,
    flashcardCount: 0,
    updatedAt: "Baru saja",
    isBookmarked: false,
  },
  {
    id: "doc-3",
    title: "Struktur Data & Algoritma",
    status: "ready",
    topicCount: 8,
    flashcardCount: 18,
    updatedAt: "Kemarin",
    isBookmarked: false,
  },
  {
    id: "doc-4",
    title: "Rekayasa Perangkat Lunak",
    status: "failed",
    topicCount: 0,
    flashcardCount: 0,
    updatedAt: "3 hari lalu",
    isBookmarked: false,
  },
  {
    id: "doc-5",
    title: "Basis Data Relasional",
    status: "ready",
    topicCount: 6,
    flashcardCount: 14,
    updatedAt: "1 minggu lalu",
    isBookmarked: true,
  },
];

export const DUMMY_SESSIONS: LearningSession[] = [
  {
    documentId: "doc-1",
    title: "Kalkulus Diferensial & Integral",
    progressPercent: 68,
    lastAccessedAt: "2 jam lalu",
    lastSection: "flashcards",
    topicCount: 12,
    flashcardCount: 24,
  },
  {
    documentId: "doc-3",
    title: "Struktur Data & Algoritma",
    progressPercent: 30,
    lastAccessedAt: "Kemarin",
    lastSection: "topics",
    topicCount: 8,
    flashcardCount: 18,
  },
];

export const DUMMY_BOOKMARKS: BookmarkedItem[] = [
  {
    id: "bm-1",
    documentId: "doc-1",
    documentTitle: "Kalkulus",
    type: "topic",
    label: "Chain Rule & Turunan Komposit",
    savedAt: "2 jam lalu",
  },
  {
    id: "bm-2",
    documentId: "doc-5",
    documentTitle: "Basis Data",
    type: "flashcard",
    label: "Apa itu normalisasi 3NF?",
    savedAt: "1 minggu lalu",
  },
  {
    id: "bm-3",
    documentId: "doc-1",
    documentTitle: "Kalkulus",
    type: "summary",
    label: "Ringkasan Bab 3: Integral Tertentu",
    savedAt: "Kemarin",
  },
];