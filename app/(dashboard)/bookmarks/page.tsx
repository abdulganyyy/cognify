"use client";

import Link from "next/link";
import { Bookmark, CreditCard, FileText, Layers, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { useBookmarksQuery, useDeleteBookmarkMutation } from "@/lib/query/hooks";
import { formatRelativeTime } from "@/lib/utils/dates";
import type { BookmarkType } from "@/types/database";

const TYPE_META: Record<
  BookmarkType,
  { label: string; icon: React.ElementType; badgeClass: string }
> = {
  document: {
    label: "Dokumen",
    icon: FileText,
    badgeClass: "bg-blue-50 text-blue-600",
  },
  summary: {
    label: "Ringkasan",
    icon: FileText,
    badgeClass: "bg-sky-50 text-sky-600",
  },
  topic: {
    label: "Topik",
    icon: Layers,
    badgeClass: "bg-violet-50 text-violet-600",
  },
  flashcard: {
    label: "Flashcard",
    icon: CreditCard,
    badgeClass: "bg-amber-50 text-amber-600",
  },
  section: {
    label: "Bagian",
    icon: FileText,
    badgeClass: "bg-emerald-50 text-emerald-600",
  },
  text: {
    label: "Sorotan",
    icon: Bookmark,
    badgeClass: "bg-neutral-100 text-neutral-700",
  },
};

export default function BookmarksPage() {
  const bookmarksQuery = useBookmarksQuery();
  const deleteMutation = useDeleteBookmarkMutation();

  const bookmarks = bookmarksQuery.data?.bookmarks ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
      <PageHeader
        eyebrow="Bookmark"
        title="Materi Tersimpan"
        description="Kumpulan dokumen, topik penting, dan flashcard yang kamu tandai untuk dipelajari kembali."
      />

      {bookmarksQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : bookmarksQuery.isError ? (
        <ErrorState
          title="Gagal memuat bookmark"
          message="Terjadi kesalahan saat mengambil daftar bookmark."
          onRetry={() => bookmarksQuery.refetch()}
        />
      ) : bookmarks.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-6 w-6 text-blue-500" />}
          title="Belum ada bookmark tersimpan"
          description="Tandai dokumen, topik, atau flashcard penting agar lebih mudah ditemukan kembali."
          action={
            <Button asChild size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
              <Link href="/documents">Jelajahi Dokumen</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bm) => {
            const meta = TYPE_META[bm.type] ?? TYPE_META.document;
            const Icon = meta.icon;

            return (
              <div
                key={bm.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background p-4 shadow-xs"
              >
                <Link
                  href={`/documents/${bm.documentId}`}
                  className="flex min-w-0 flex-1 items-center gap-3.5"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.badgeClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {bm.label}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {meta.label} · {bm.documentTitle} · {formatRelativeTime(bm.savedAt)}
                    </p>
                  </div>
                </Link>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(bm.id)}
                  aria-label="Hapus bookmark"
                  className="shrink-0 text-neutral-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
