export const queryKeys = {
  dashboard: ["dashboard"] as const,
  documents: (search?: string) => ["documents", { search: search ?? "" }] as const,
  documentDetail: (documentId: string) => ["document", documentId] as const,
  documentStatus: (documentId: string) => ["document", documentId, "status"] as const,
  documentChat: (documentId: string) => ["document", documentId, "chat"] as const,
  bookmarks: ["bookmarks"] as const,
};
