"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Clock3,
  Layers,
  Loader2,
  RefreshCw,
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

type WorkspaceTab = "summary" | "topics" | "flashcards" | "chat";

function parseTabParam(raw: string | null): WorkspaceTab {
  if (raw === "topics" || raw === "flashcards" || raw === "chat") return raw;
  return "summary";
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
    <section className="rounded-xl border border-neutral-100 bg-white p-5">
      <SectionHeader
        variant="label"
        icon={
          document.status === "failed" ? (
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          ) : (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
          )
        }
        title="Status Pemrosesan AI"
        description="Tahapan analisis dokumen oleh AI."
        className="mb-3"
      />

      <div className="space-y-2.5">
        {document.status === "failed" && document.processingError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/70 p-3.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-neutral-800">
                Pemrosesan dokumen gagal
              </p>
              <p className="mt-1 text-xs leading-relaxed text-red-700">
                {document.processingError}
              </p>
              <Button
                type="button"
                size="xs"
                variant="outline"
                disabled={isRetrying}
                onClick={onRetry}
                className="mt-2.5 h-7 gap-1.5 rounded-lg bg-white text-xs"
              >
                {isRetrying ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Proses Ulang
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item) => {
            const done = item.status === "ready";
            const failed = item.status === "failed";
            const running = item.status === "processing";

            return (
              <div
                key={item.label}
                className="flex items-start gap-2.5 rounded-xl border border-neutral-100 bg-neutral-50/60 p-3"
              >
                {done ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                ) : failed ? (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                ) : running ? (
                  <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-amber-500" />
                ) : (
                  <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                )}

                <div className="min-w-0">
                  <p className="text-xs font-medium leading-snug text-neutral-800">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    {done
                      ? "Selesai"
                      : failed
                        ? "Gagal"
                        : running
                          ? "Memproses…"
                          : "Antrean"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DocumentWorkspaceSkeleton() {
  return (
    <div className="flex flex-1 flex-col lg:h-full lg:overflow-hidden">
      <div className="border-b border-neutral-100 bg-white px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="hidden gap-2 lg:flex">
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-5 lg:p-6">
          <div className="mx-auto max-w-4xl space-y-4">
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
        <div className="hidden w-[340px] shrink-0 border-l border-neutral-100 bg-neutral-50/50 p-4 lg:block xl:w-[380px]">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function DocumentDetailWorkspace({ documentId }: { documentId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [tabState, setTabState] = useState<{
    param: string | null;
    tab: WorkspaceTab;
  }>(() => ({
    param: tabParam,
    tab: parseTabParam(tabParam),
  }));
  const [chatOpen, setChatOpen] = useState(true);
  const [chatDraft, setChatDraft] = useState("");
  const [renameOpen, setRenameOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => 0);

  const activeTab =
    tabState.param === tabParam ? tabState.tab : parseTabParam(tabParam);

  const setActiveTab = (tab: WorkspaceTab) => {
    setTabState({ param: tabParam, tab });
  };

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
    return <DocumentWorkspaceSkeleton />;
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
  const isChatReady = doc.textExtracted && doc.sections.length > 0;

  const handleAskTopic = (topicName: string) => {
    setChatDraft(`Jelaskan lebih detail tentang topik "${topicName}" dari dokumen ini.`);
    setChatOpen(true);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setActiveTab("chat");
    }
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => setActiveTab(val as WorkspaceTab)}
      className="flex flex-1 flex-col gap-0 lg:h-full lg:overflow-hidden"
    >
      {/* Topbar terpadu ala DashboardPreview */}
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
        onRename={() => {
          setNewTitle(doc.title);
          setRenameOpen(true);
        }}
        onRetryProcess={() => retryMutation.mutate()}
        onDelete={() => setDeleteOpen(true)}
        isProcessing={isActivelyProcessing}
        chatOpen={chatOpen}
        onToggleChat={() => setChatOpen((prev) => !prev)}
        tabsSlot={
          <TabsList variant="pill">
            <TabsTrigger value="summary">Ringkasan</TabsTrigger>
            <TabsTrigger value="topics">Topik ({doc.topics.length})</TabsTrigger>
            <TabsTrigger value="flashcards">
              Flashcards ({doc.flashcards.length})
            </TabsTrigger>
            <TabsTrigger value="chat" className="lg:hidden">
              Tutor AI
            </TabsTrigger>
          </TabsList>
        }
      />

      {/* Split-View Workspace: Center Content + Right Chat Panel */}
      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        {/* Center Study Pane */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-4xl space-y-4">
            {doc.status !== "ready" && (
              <ProcessingOverview
                document={doc}
                onRetry={() => retryMutation.mutate()}
                isRetrying={retryMutation.isPending}
              />
            )}

            <TabsContent value="summary" className="mt-0 space-y-4">
              <DocumentSummaryCard
                summary={doc.fullSummary}
                shortSummary={doc.shortSummary}
                isRegenerating={regenSummaryMutation.isPending}
                onRegenerate={
                  doc.textExtracted ? () => regenSummaryMutation.mutate() : undefined
                }
              />

              {/* Preview Topik Utama ala DashboardPreview */}
              {doc.topics.length > 0 && (
                <section className="rounded-xl border border-neutral-100 bg-white p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-blue-500" />
                      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Topik Utama
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("topics")}
                      className="inline-flex items-center gap-0.5 text-[11px] font-medium text-blue-600 transition-colors hover:text-blue-700"
                    >
                      {doc.topics.length} topik · Lihat detail
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {doc.topics.map((topic) => (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setActiveTab("topics")}
                        className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-600 transition-colors hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700"
                      >
                        {topic.name}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Banner Flashcard Siap ala DashboardPreview */}
              <section className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                    {doc.flashcards.length > 0 ? "Flashcard Siap" : "Flashcards"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-neutral-600">
                    {doc.flashcards.length > 0
                      ? `${doc.flashcards.length} kartu dibuat otomatis dari dokumen ini`
                      : "Belum ada flashcard — buat kartu manual atau tunggu pemrosesan AI."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("flashcards")}
                    className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                  >
                    Mulai belajar
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="topics" className="mt-0">
              <DocumentTopicsSection
                topics={doc.topics.map((t) => ({
                  id: t.id,
                  label: t.name,
                  description: t.description,
                  importanceScore: t.importanceScore,
                  isBookmarked: t.isBookmarked,
                }))}
                isRegenerating={regenTopicsMutation.isPending}
                onAskTopic={isChatReady ? handleAskTopic : undefined}
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

            <TabsContent value="flashcards" className="mt-0">
              <DocumentFlashcardsSection
                documentId={doc.id}
                flashcards={doc.flashcards}
                isProcessing={isActivelyProcessing}
              />
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <div className="lg:hidden">
                <DocumentChatPanel
                  documentId={doc.id}
                  isReady={isChatReady}
                  variant="card"
                  draft={chatDraft}
                  onDraftChange={setChatDraft}
                />
              </div>
              <div className="hidden space-y-4 lg:block">
                <DocumentSummaryCard
                  summary={doc.fullSummary}
                  shortSummary={doc.shortSummary}
                  isRegenerating={regenSummaryMutation.isPending}
                  onRegenerate={
                    doc.textExtracted
                      ? () => regenSummaryMutation.mutate()
                      : undefined
                  }
                />
              </div>
            </TabsContent>
          </div>
        </div>

        {/* Right Split Chat Panel (Desktop, selalu terbuka secara default ala DashboardPreview) */}
        {chatOpen && (
          <aside className="hidden lg:flex lg:w-[340px] xl:w-[380px] shrink-0 flex-col border-l border-neutral-100 bg-neutral-50/50 overflow-hidden">
            <DocumentChatPanel
              documentId={doc.id}
              isReady={isChatReady}
              variant="panel"
              draft={chatDraft}
              onDraftChange={setChatDraft}
            />
          </aside>
        )}
      </div>

      {/* Dialog Ubah Judul */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Judul Dokumen</DialogTitle>
            <DialogDescription>
              Perbarui nama dokumen agar lebih mudah dikenali di ruang belajarmu.
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
    </Tabs>
  );
}

export default function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { documentId } = use(params);

  return (
    <Suspense fallback={<DocumentWorkspaceSkeleton />}>
      <DocumentDetailWorkspace documentId={documentId} />
    </Suspense>
  );
}
