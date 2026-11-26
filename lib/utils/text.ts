export function sanitizeFileName(fileName: string): string {
  const base = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");
  return base.slice(0, 120) || "document.pdf";
}

export function deriveDocumentTitle(fileName: string): string {
  const withoutExt = fileName.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim();
  return withoutExt || "Dokumen Tanpa Judul";
}

export function estimateTokenCount(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trim()}...`;
}
