import type {
  BookmarkItemView,
  ChatMessageView,
  ContinueLearningItem,
  DocumentDetail,
  DocumentListItem,
  UserProfileSummary,
} from "@/types/domain";
import type { DocumentStatus, ProcessingStatus } from "@/types/database";

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

export interface SignedUrlRequest {
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
}

export interface SignedUrlResponse {
  documentId: string;
  storagePath: string;
  signedUrl: string;
  token: string;
}

export interface CreateDocumentRequest {
  documentId: string;
  title: string;
  originalFileName: string;
  storagePath: string;
  fileSizeBytes: number;
  mimeType: string;
}

export interface DocumentsListResponse {
  documents: DocumentListItem[];
}

export interface DocumentDetailResponse {
  document: DocumentDetail;
}

export interface DocumentStatusResponse {
  id: string;
  status: DocumentStatus;
  summaryStatus: ProcessingStatus;
  topicStatus: ProcessingStatus;
  flashcardStatus: ProcessingStatus;
  processingError: string | null;
  textExtracted: boolean;
  pageCount: number | null;
}

export interface DashboardResponse {
  user: UserProfileSummary;
  documents: DocumentListItem[];
  continueLearning: ContinueLearningItem[];
  bookmarks: BookmarkItemView[];
}

export interface ChatHistoryResponse {
  sessionId: string | null;
  messages: ChatMessageView[];
}

export interface SendChatResponse {
  sessionId: string;
  userMessage: ChatMessageView;
  assistantMessage: ChatMessageView;
}
