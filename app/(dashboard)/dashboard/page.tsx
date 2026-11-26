"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadModal } from "@/components/documents/UploadDocumentDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { useDashboardQuery } from "@/lib/query/hooks";
import { formatRelativeTime } from "@/lib/utils/dates";
import { ContinueLearning } from "./_sections/ContinueLearning";
import { DashboardGreeting } from "./_sections/DashboardGreeting";
import { DashboardSearch } from "./_sections/DashboardSearch";
import { DashboardEmptyState, DashboardSkeleton } from "./_sections/DashboardStates";
import { QuickBookmarks } from "./_sections/QuickBookmark";
import { RecentDocuments } from "./_sections/RecentDocument";
import { UploadCtaCard } from "./_sections/UploadCtaCard";
import type { BookmarkedItem, Document, LearningSession } from "./types";

export default function DashboardPage() {
  const router = useRouter();
  const { openUploadModal } = useUploadModal();
  const [searchQuery, setSearchQuery] = useState("");
  const dashboardQuery = useDashboardQuery();

  const allDocuments: Document[] = useMemo(
    () =>
      (dashboardQuery.data?.documents ?? []).map((doc) => ({
        id: doc.id,
        title: doc.title,
        status: doc.status,
        topicCount: doc.topicCount,
        flashcardCount: doc.flashcardCount,
        updatedAt: formatRelativeTime(doc.updatedAt),
        isBookmarked: doc.isBookmarked,
      })),
    [dashboardQuery.data?.documents]
  );

  const sessions: LearningSession[] = useMemo(
    () =>
      (dashboardQuery.data?.continueLearning ?? []).map((item) => ({
        documentId: item.documentId,
        title: item.title,
        progressPercent: item.progressPercent,
        lastAccessedAt: formatRelativeTime(item.lastAccessedAt),
        lastSection: item.lastSection,
        topicCount: item.topicCount,
        flashcardCount: item.flashcardCount,
      })),
    [dashboardQuery.data?.continueLearning]
  );

  const bookmarks: BookmarkedItem[] = useMemo(
    () =>
      (dashboardQuery.data?.bookmarks ?? []).map((bm) => ({
        id: bm.id,
        documentId: bm.documentId,
        documentTitle: bm.documentTitle,
        type: bm.type,
        label: bm.label,
        savedAt: formatRelativeTime(bm.savedAt),
      })),
    [dashboardQuery.data?.bookmarks]
  );

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return allDocuments;
    const q = searchQuery.toLowerCase();
    return allDocuments.filter((doc) => doc.title.toLowerCase().includes(q));
  }, [allDocuments, searchQuery]);

  if (dashboardQuery.isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <ErrorState
          title="Gagal memuat beranda"
          message="Terjadi kendala saat mengambil data ruang kerjamu."
          onRetry={() => dashboardQuery.refetch()}
        />
      </div>
    );
  }

  const user = {
    name: dashboardQuery.data.user.name,
    email: dashboardQuery.data.user.email,
    avatarUrl: dashboardQuery.data.user.avatarUrl ?? undefined,
  };

  const hasDocuments = allDocuments.length > 0;
  const hasSearchResults = filteredDocuments.length > 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex flex-col gap-8">
        <DashboardGreeting
          user={user}
          documentCount={allDocuments.length}
          onUploadClick={openUploadModal}
        />

        {hasDocuments && <DashboardSearch onSearch={setSearchQuery} />}

        {!hasDocuments && <DashboardEmptyState onUploadClick={openUploadModal} />}

        {hasDocuments && (
          <>
            {!searchQuery && <UploadCtaCard onUploadClick={openUploadModal} />}

            {!searchQuery && sessions.length > 0 && (
              <ContinueLearning
                sessions={sessions}
                onContinue={(documentId) => router.push(`/documents/${documentId}`)}
              />
            )}

            {hasSearchResults ? (
              <RecentDocuments
                documents={filteredDocuments.slice(0, 6)}
                onDocumentClick={(id) => router.push(`/documents/${id}`)}
                onViewAll={() => router.push("/documents")}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 px-6 py-10 text-center">
                <p className="text-sm font-medium text-neutral-600">
                  Tidak ada dokumen yang cocok dengan &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Coba kata kunci lain atau unggah PDF baru.
                </p>
              </div>
            )}

            {!searchQuery && bookmarks.length > 0 && (
              <QuickBookmarks
                items={bookmarks}
                onItemClick={(item) => router.push(`/documents/${item.documentId}`)}
                onViewAll={() => router.push("/bookmarks")}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
