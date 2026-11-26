"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, CreditCard, FileText, Layers, Search, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { useBookmarksQuery, useDeleteBookmarkMutation } from "@/lib/query/hooks";
import { formatRelativeTime } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import type { BookmarkType } from "@/types/database";
import { DashboardSearch } from "../dashboard/_sections/DashboardSearch";

const TYPE_META: Record<
  BookmarkType,
  { label: string; icon: React.ElementType; badgeClass: string }
> = {
  document: {
    label: "Dokumen",
    icon: FileText,
    badgeClass: "bg-blue-50 text-blue-500",
  },
  summary: {
    label: "Ringkasan",
    icon: FileText,
    badgeClass: "bg-sky-50 text-sky-500",
  },
  topic: {
    label: "Topik",
    icon: Layers,
    badgeClass: "bg-violet-50 text-violet-500",
  },
  flashcard: {
    label: "Flashcard",
    icon: CreditCard,
    badgeClass: "bg-amber-50 text-amber-500",
  },
  section: {
    label: "Bagian",
    icon: FileText,
    badgeClass: "bg-emerald-50 text-emerald-500",
  },
  text: {
    label: "Sorotan",
    icon: Bookmark,
    badgeClass: "bg-neutral-100 text-neutral-600",
  },
};

function getBookmarkHref(type: BookmarkType, documentId: string): string {
  if (type === "topic") return `/documents/${documentId}?tab=topics`;
  if (type === "flashcard") return `/documents/${documentId}?tab=flashcards`;
  return `/documents/${documentId}`;
}

export default function BookmarksPage() {
  const bookmarksQuery = useBookmarksQuery();
  const deleteMutation = useDeleteBookmarkMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<BookmarkType | "all">("all");

  const bookmarks = useMemo(
    () => bookmarksQuery.data?.bookmarks ?? [],
    [bookmarksQuery.data?.bookmarks]
  );

  const availableTypes = useMemo(() => {
    const counts = new Map<BookmarkType, number>();
    for (const bm of bookmarks) {
      counts.set(bm.type, (counts.get(bm.type) ?? 0) + 1);
    }
    return Array.from(counts.entries());
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bookmarks.filter((bm) => {
      if (selectedType !== "all" && bm.type !== selectedType) return false;
      if (!q) return true;
      return (
        bm.label.toLowerCase().includes(q) ||
        bm.documentTitle.toLowerCase().includes(q)
      );
    });
  }, [bookmarks, searchQuery, selectedType]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <PageHeader
        title="Materi Tersimpan"
        description="Kumpulan dokumen, topik penting, dan flashcard yang kamu tandai untuk dipelajari kembali."
      />

      {bookmarksQuery.isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
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
          icon={<Bookmark className="h-5 w-5 text-blue-500" />}
          title="Belum ada bookmark tersimpan"
          description="Tandai dokumen, topik, atau flashcard penting agar lebih mudah ditemukan kembali."
          action={
            <Button
              asChild
              size="sm"
              className="bg-blue-600 text-xs text-white hover:bg-blue-700"
            >
              <Link href="/documents">Jelajahi Dokumen</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <DashboardSearch
            onSearch={setSearchQuery}
            placeholder="Cari bookmark atau judul dokumen…"
          />

          {/* Type filter pills */}
          {availableTypes.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedType("all")}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  selectedType === "all"
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-neutral-200 bg-white text-neutral-500 hover:text-neutral-800"
                )}
              >
                Semua ({bookmarks.length})
              </button>
              {availableTypes.map(([type, count]) => {
                const meta = TYPE_META[type] ?? TYPE_META.document;
                const active = selectedType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-neutral-200 bg-white text-neutral-500 hover:text-neutral-800"
                    )}
                  >
                    {meta.label} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {filteredBookmarks.length === 0 ? (
            <EmptyState
              icon={<Search className="h-5 w-5 text-blue-500" />}
              title="Bookmark tidak ditemukan"
              description="Coba ubah filter kategori atau kata kunci pencarianmu."
            />
          ) : (
            <div className="space-y-2">
              {filteredBookmarks.map((bm) => {
                const meta = TYPE_META[bm.type] ?? TYPE_META.document;
                const Icon = meta.icon;

                return (
                  <div
                    key={bm.id}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-neutral-100 bg-white px-4 py-3 transition-all hover:border-neutral-200 hover:shadow-sm"
                  >
                    <Link
                      href={getBookmarkHref(bm.type, bm.documentId)}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          meta.badgeClass
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-neutral-800 group-hover:text-blue-600 transition-colors">
                          {bm.label}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-neutral-400">
                          {meta.label} · {bm.documentTitle} ·{" "}
                          {formatRelativeTime(bm.savedAt)}
                        </p>
                      </div>
                    </Link>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(bm.id)}
                      aria-label="Hapus bookmark"
                      className="shrink-0 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
