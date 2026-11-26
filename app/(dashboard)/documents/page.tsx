"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { DocumentList } from "@/components/documents/DocumentList";
import { useUploadModal } from "@/components/documents/UploadDocumentDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDeleteDocumentMutation,
  useDocumentsQuery,
  useToggleBookmarkMutation,
} from "@/lib/query/hooks";
import { queryKeys } from "@/lib/query/keys";
import { formatRelativeTime } from "@/lib/utils/dates";
import { DashboardSearch } from "../dashboard/_sections/DashboardSearch";

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(
    null
  );
  const queryClient = useQueryClient();
  const { openUploadModal } = useUploadModal();
  const documentsQuery = useDocumentsQuery(searchQuery);
  const bookmarkMutation = useToggleBookmarkMutation();
  const deleteMutation = useDeleteDocumentMutation();

  const handleRetryDocument = async (documentId: string) => {
    try {
      toast.info("Memulai pemrosesan ulang dokumen...");
      const res = await fetch(`/api/documents/${documentId}/process`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Gagal memproses ulang dokumen."
        );
      }
      toast.success("Dokumen selesai diproses ulang.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memproses ulang.");
    } finally {
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    }
  };

  const documents = (documentsQuery.data?.documents ?? []).map((doc) => ({
    id: doc.id,
    title: doc.title,
    description:
      doc.shortSummary ??
      (doc.status === "failed"
        ? doc.processingError ?? "Pemrosesan dokumen gagal."
        : doc.originalFileName),
    status: doc.status,
    updatedAt: formatRelativeTime(doc.updatedAt),
    pageCount: doc.pageCount ?? undefined,
    bookmarked: doc.isBookmarked,
    topics: doc.topics,
    onBookmarkToggle: () =>
      void bookmarkMutation.mutateAsync({
        documentId: doc.id,
        bookmarkType: "document",
      }),
    onRetryProcess: () => void handleRetryDocument(doc.id),
    onDelete: () => setDeleteTarget({ id: doc.id, title: doc.title }),
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <PageHeader
        title="Dokumen Belajar"
        description="Kelola materi PDF, pantau status pemrosesan AI, dan buka ruang belajarmu."
        actions={
          <Button
            type="button"
            size="sm"
            onClick={openUploadModal}
            className="h-9 gap-2 bg-blue-600 px-4 text-xs font-medium text-white shadow-sm shadow-blue-100 hover:bg-blue-700"
          >
            <Upload className="h-3.5 w-3.5" />
            Unggah PDF
          </Button>
        }
      />

      <DashboardSearch
        onSearch={setSearchQuery}
        placeholder="Cari judul dokumen…"
      />

      <section className="space-y-3">
        {!documentsQuery.isLoading && !documentsQuery.isError && documents.length > 0 && (
          <p className="text-xs text-neutral-400">
            Menampilkan {documents.length} dokumen
            {searchQuery.trim() ? ` untuk "${searchQuery.trim()}"` : ""}
          </p>
        )}

        <DocumentList
          documents={documents}
          isLoading={documentsQuery.isLoading}
          isError={documentsQuery.isError}
          onRetry={() => documentsQuery.refetch()}
          hasSearchQuery={Boolean(searchQuery.trim())}
          searchQuery={searchQuery.trim()}
          onUploadClick={openUploadModal}
        />
      </section>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Dokumen?</DialogTitle>
            <DialogDescription>
              Dokumen &ldquo;{deleteTarget?.title}&rdquo; beserta ringkasan, topik,
              flashcard, dan riwayat chat akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteTarget(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={async () => {
                if (!deleteTarget) return;
                await deleteMutation.mutateAsync(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
