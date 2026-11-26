"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/browser";
import { queryKeys } from "@/lib/query/keys";
import { deriveDocumentTitle } from "@/lib/utils/text";
import type {
  ChatHistoryResponse,
  DashboardResponse,
  DocumentDetailResponse,
  DocumentsListResponse,
  SendChatResponse,
  SignedUrlResponse,
} from "@/types/api";
import type { BookmarkItemView } from "@/types/domain";
import type { BookmarkType } from "@/types/database";

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof payload?.error === "string"
        ? payload.error
        : "Terjadi kesalahan saat menghubungi server."
    );
  }

  return payload as T;
}

export function useDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => apiFetch<DashboardResponse>("/api/dashboard"),
  });
}

export function useDocumentsQuery(search?: string) {
  return useQuery({
    queryKey: queryKeys.documents(search),
    queryFn: () => {
      const params = new URLSearchParams();
      if (search?.trim()) params.set("q", search.trim());
      const qs = params.toString();
      return apiFetch<DocumentsListResponse>(`/api/documents${qs ? `?${qs}` : ""}`);
    },
  });
}

export function useDocumentDetailQuery(documentId: string) {
  return useQuery({
    queryKey: queryKeys.documentDetail(documentId),
    queryFn: () =>
      apiFetch<DocumentDetailResponse>(`/api/documents/${documentId}`),
    enabled: Boolean(documentId),
    refetchInterval: (query) => {
      const status = query.state.data?.document.status;
      return status === "uploaded" || status === "processing" ? 2500 : false;
    },
  });
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { file: File; title?: string }) => {
      const { file } = params;
      const title = params.title?.trim() || deriveDocumentTitle(file.name);

      const signed = await apiFetch<SignedUrlResponse>("/api/uploads/signed-url", {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type || "application/pdf",
        }),
      });

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .uploadToSignedUrl(signed.storagePath, signed.token, file, {
          contentType: "application/pdf",
        });

      if (uploadError) {
        throw new Error(uploadError.message || "Gagal mengunggah file PDF.");
      }

      await apiFetch("/api/documents", {
        method: "POST",
        body: JSON.stringify({
          documentId: signed.documentId,
          title,
          originalFileName: file.name,
          storagePath: signed.storagePath,
          fileSizeBytes: file.size,
          mimeType: file.type || "application/pdf",
        }),
      });

      // Jalankan proses ekstraksi & AI di latar belakang tanpa memblokir navigasi
      void fetch(`/api/documents/${signed.documentId}/process`, {
        method: "POST",
      })
        .then(async (res) => {
          if (!res.ok) {
            const payload = await res.json().catch(() => ({}));
            const msg =
              typeof payload?.error === "string"
                ? payload.error
                : "Pemrosesan dokumen gagal.";
            toast.error(msg);
          }
        })
        .catch(() => {
          toast.error("Koneksi terputus saat memproses dokumen.");
        })
        .finally(() => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
          void queryClient.invalidateQueries({ queryKey: ["documents"] });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.documentDetail(signed.documentId),
          });
        });

      return signed.documentId;
    },
    onSuccess: () => {
      toast.success("PDF berhasil diunggah. AI sedang memproses dokumenmu...");
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useRetryProcessMutation(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch(`/api/documents/${documentId}/process`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Dokumen selesai diproses ulang.");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documentDetail(documentId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documentDetail(documentId),
      });
    },
  });
}

export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) =>
      apiFetch(`/api/documents/${documentId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Dokumen berhasil dihapus.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRenameDocumentMutation(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) =>
      apiFetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      }),
    onSuccess: () => {
      toast.success("Judul dokumen diperbarui.");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documentDetail(documentId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRegenerateSummaryMutation(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch(`/api/documents/${documentId}/summary`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Ringkasan berhasil dibuat ulang.");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documentDetail(documentId),
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRegenerateTopicsMutation(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch(`/api/documents/${documentId}/topics`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Topik utama berhasil dibuat ulang.");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documentDetail(documentId),
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCreateFlashcardMutation(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      question: string;
      answer: string;
      difficulty?: "easy" | "medium" | "hard";
    }) =>
      apiFetch(`/api/documents/${documentId}/flashcards`, {
        method: "POST",
        body: JSON.stringify({ action: "create", ...payload }),
      }),
    onSuccess: () => {
      toast.success("Flashcard berhasil ditambahkan.");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documentDetail(documentId),
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRegenerateFlashcardsMutation(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch(`/api/documents/${documentId}/flashcards`, {
        method: "POST",
        body: JSON.stringify({ action: "regenerate" }),
      }),
    onSuccess: () => {
      toast.success("Flashcard AI berhasil dibuat ulang.");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documentDetail(documentId),
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteFlashcardMutation(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (flashcardId: string) =>
      apiFetch(`/api/documents/${documentId}/flashcards/${flashcardId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Flashcard dihapus.");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documentDetail(documentId),
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateFlashcardMutation(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      flashcardId,
      ...payload
    }: {
      flashcardId: string;
      question: string;
      answer: string;
      difficulty: "easy" | "medium" | "hard";
    }) =>
      apiFetch(`/api/documents/${documentId}/flashcards/${flashcardId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: (_data, variables) => {
      toast.success("Flashcard berhasil diperbarui.");
      queryClient.setQueryData<DocumentDetailResponse>(
        queryKeys.documentDetail(documentId),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            document: {
              ...prev.document,
              flashcards: prev.document.flashcards.map((card) =>
                card.id === variables.flashcardId
                  ? {
                      ...card,
                      question: variables.question,
                      answer: variables.answer,
                      difficulty: variables.difficulty,
                    }
                  : card
              ),
            },
          };
        }
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documentDetail(documentId),
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDocumentChatQuery(documentId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.documentChat(documentId),
    queryFn: () =>
      apiFetch<ChatHistoryResponse>(`/api/documents/${documentId}/chat`),
    enabled: Boolean(documentId) && enabled,
  });
}

export function useSendChatMutation(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { message: string; sessionId?: string }) =>
      apiFetch<SendChatResponse>(`/api/documents/${documentId}/chat`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documentChat(documentId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useBookmarksQuery() {
  return useQuery({
    queryKey: queryKeys.bookmarks,
    queryFn: () => apiFetch<{ bookmarks: BookmarkItemView[] }>("/api/bookmarks"),
  });
}

export function useToggleBookmarkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      documentId: string;
      bookmarkType: BookmarkType;
      topicId?: string | null;
      flashcardId?: string | null;
      sectionId?: string | null;
    }) =>
      apiFetch<{ bookmarked: boolean; id: string }>("/api/bookmarks", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (res, vars) => {
      toast.success(
        res.bookmarked ? "Disimpan ke bookmark." : "Dihapus dari bookmark."
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documentDetail(vars.documentId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteBookmarkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/bookmarks?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Bookmark dihapus.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
