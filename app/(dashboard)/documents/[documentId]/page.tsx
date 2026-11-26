"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { DocumentChatPanel } from "@/components/documents/DocumentChatPanel";
import { DocumentDetailHeader } from "@/components/documents/DocumentDetailHeader";
import { DocumentFlashcardsSection } from "@/components/documents/DocumentFlashcardsSection";
import { DocumentSummaryCard } from "@/components/documents/DocumentSummaryCard";
import { DocumentTopicsSection } from "@/components/documents/DocumentTopicsSection";
import { ErrorState } from "@/components/shared/ErrorState";
import { Skeleton } from "@/components/shared/LoadingSkeleton";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDeleteDocumentMutation,
  useDocumentDetailQuery,
  useRegenerateSummaryMutation,
  useRegenerateTopicsMutation,
  useRenameDocumentMutation,
  useRetryProcessMutation,
  useToggleBookmarkMutation,
} from "@/lib/query/hooks";
import { formatFileSize, formatRelativeTime } from "@/lib/utils/dates";
import type { DocumentDetail } from "@/types/domain";

interface DocumentDetailPageProps {
  params: Promise<{
    documentId: string;
  }>;
}

function ProcessingOverview({
  document,
  onRetry,
  isRetrying,
}: {
  document: DocumentDetail;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  const items = [
    {
      label: "Dokumen diunggah",
      status: "ready" as const,
    },
    {
      label: "Ekstraksi teks PDF",
      status: document.textExtracted
        ? ("ready" as const)
        : document.status === "failed"
          ? ("failed" as const)
          : ("processing" as const),
    },
    {
      label: "Ringkasan AI",
      status: document.summaryStatus,
    },
    {
      label: "Ekstraksi topik utama",
      status: document.topicStatus,
    },
    {
      label: "Pembuatan flashcards",
      status: document.flashcardStatus,
    },
  ];

  return (
    <section className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm sm:p-6">
      <SectionHeader
        title="Status Pemrosesan"
        description="Tahapan analisis dokumen oleh AI."
      />

      <div className="mt-5 space-y-3">
        {document.status === "failed" && document.processingError && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/70 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                Pemrosesan dokumen gagal
              </p>
              <p className="mt-1 text-xs leading-5 text-red-700">
                {document.processingError}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isRetrying}
                onClick={onRetry}
                className="mt-3 gap-1.5 bg-white"
              >
                {isRetrying ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Proses Ulang
              </Button>
            </div>
          </div>
        )}

        {items.map((item) => {
          const done = item.status === "ready";
          const failed = item.status === "failed";
          const running = item.status === "processing";

          return (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3.5"
            >
              {done ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : failed ? (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              ) : running ? (
                <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-amber-600" />
              ) : (
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
              )}

              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {done
                    ? "Selesai"
                    : failed
                      ? "Gagal diproses"
                      : running
                        ? "Sedang diproses..."
                        : "Menunggu antrean"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { documentId } = use(params);
  const router = useRouter();

  const [renameOpen, setRenameOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => 0);

  const detailQuery = useDocumentDetailQuery(documentId);

  useEffect(() => {
    const initial = setTimeout(() => setNowMs(Date.now()), 0);
    const interval = setInterval(() => setNowMs(Date.now()), 15_000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);
  const retryMutation = useRetryProcessMutation(documentId);
  const deleteMutation = useDeleteDocumentMutation();
  const renameMutation = useRenameDocumentMutation(documentId);
  const regenSummaryMutation = useRegenerateSummaryMutation(documentId);
  const regenTopicsMutation = useRegenerateTopicsMutation(documentId);
  const bookmarkMutation = useToggleBookmarkMutation();

  if (detailQuery.isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-10 w-80 rounded-xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data?.document) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <ErrorState
          title="Dokumen tidak dapat dimuat"
          message={
            detailQuery.error instanceof Error
              ? detailQuery.error.message
              : "Dokumen mungkin sudah dihapus atau kamu tidak memiliki akses."
          }
          onRetry={() => detailQuery.refetch()}
        />
      </div>
    );
  }

  const doc = detailQuery.data.document;
  const isStaleProcessing =
    doc.status === "processing" &&
    nowMs > 0 &&
    nowMs - new Date(doc.updatedAt).getTime() >= 3 * 60 * 1000;
  const isActivelyProcessing =
    retryMutation.isPending ||
    doc.status === "uploaded" ||
    (doc.status === "processing" && !isStaleProcessing);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <DocumentDetailHeader
        title={doc.title}
        description={`${doc.originalFileName} · ${formatFileSize(doc.fileSizeBytes)}`}
        status={doc.status}
        updatedAt={formatRelativeTime(doc.updatedAt)}
        pageCount={doc.pageCount ?? undefined}
        bookmarked={doc.isBookmarked}
        onBookmarkToggle={() =>
          void bookmarkMutation.mutateAsync({
            documentId: doc.id,
            bookmarkType: "document",
          })
        }
        backLabel="Kembali ke Dokumen"
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setNewTitle(doc.title);
                setRenameOpen(true);
              }}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Ubah Judul
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isActivelyProcessing}
              onClick={() => retryMutation.mutate()}
            >
              {isActivelyProcessing ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              )}
              Proses Ulang
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Hapus
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 rounded-xl">
              <TabsTrigger value="summary">Ringkasan</TabsTrigger>
              <TabsTrigger value="topics">
                Topik ({doc.topics.length})
              </TabsTrigger>
              <TabsTrigger value="flashcards">
                Flashcards ({doc.flashcards.length})
              </TabsTrigger>
              <TabsTrigger value="chat">Tutor AI</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <DocumentSummaryCard
                summary={doc.fullSummary}
                shortSummary={doc.shortSummary}
                isRegenerating={regenSummaryMutation.isPending}
                onRegenerate={
                  doc.textExtracted ? () => regenSummaryMutation.mutate() : undefined
                }
              />
            </TabsContent>

            <TabsContent value="topics">
              <DocumentTopicsSection
                topics={doc.topics.map((t) => ({
                  id: t.id,
                  label: t.name,
                  description: t.description,
                  isBookmarked: t.isBookmarked,
                }))}
                isRegenerating={regenTopicsMutation.isPending}
                onRegenerate={
                  doc.textExtracted ? () => regenTopicsMutation.mutate() : undefined
                }
                onToggleBookmark={(topicId) =>
                  void bookmarkMutation.mutateAsync({
                    documentId: doc.id,
                    bookmarkType: "topic",
                    topicId,
                  })
                }
              />
            </TabsContent>

            <TabsContent value="flashcards">
              <DocumentFlashcardsSection
                documentId={doc.id}
                flashcards={doc.flashcards}
                isProcessing={isActivelyProcessing}
              />
            </TabsContent>

            <TabsContent value="chat">
              <DocumentChatPanel
                documentId={doc.id}
                isReady={doc.textExtracted && doc.sections.length > 0}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <ProcessingOverview
            document={doc}
            onRetry={() => retryMutation.mutate()}
            isRetrying={retryMutation.isPending}
          />
        </div>
      </div>

      {/* Dialog Ubah Judul */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Judul Dokumen</DialogTitle>
            <DialogDescription>
              Perbarui nama dokumen agar lebih mudah dikenali di ruang kerjamu.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newTitle.trim()) return;
              await renameMutation.mutateAsync(newTitle.trim());
              setRenameOpen(false);
            }}
            className="space-y-4"
          >
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Judul dokumen"
              required
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={renameMutation.isPending}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {renameMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Dokumen?</DialogTitle>
            <DialogDescription>
              Dokumen &ldquo;{doc.title}&rdquo; beserta ringkasan, topik, flashcard, dan
              riwayat chat akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={async () => {
                await deleteMutation.mutateAsync(doc.id);
                setDeleteOpen(false);
                router.push("/documents");
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
