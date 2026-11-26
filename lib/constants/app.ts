export const APP_NAME = "Cognify";
export const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_PDF_SIZE_MB = 10;
export const ALLOWED_PDF_MIME_TYPES = ["application/pdf"] as const;
export const STORAGE_DOCUMENTS_BUCKET = "documents";

export const PROTECTED_ROUTES = ["/dashboard", "/documents", "/bookmarks"] as const;
export const AUTH_ROUTES = ["/login", "/register"] as const;
