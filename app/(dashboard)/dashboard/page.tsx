/**
 * Dashboard Home Page — Cognify
 * File: app/(dashboard)/dashboard/page.tsx
 *
 * Halaman ini adalah Client Component karena ada state search dan interaksi.
 * Data fetching disambungkan via props dari layout atau useEffect sesuai stack.
 *
 * ─── Cara sambungkan ke data asli ────────────────────────────────────────────
 *
 * Ganti DUMMY_* dengan data dari:
 *   - Server Component props (fetch di layout atau page server side)
 *   - React Query / SWR hooks
 *   - Zustand / context store
 *   - Supabase realtime subscription
 *
 * Tidak ada perubahan pada komponen section yang diperlukan.
 * Cukup ganti sumber data di bagian "Data source" bawah.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useMemo } from "react";

// ── Sections ────────────────────────────────────────────────────────────────
import { DashboardGreeting } from "./_sections/DashboardGreeting";
import { DashboardSearch } from "./_sections/DashboardSearch";
import { UploadCtaCard } from "./_sections/UploadCtaCard";
import { ContinueLearning } from "./_sections/ContinueLearning";
import { RecentDocuments } from "./_sections/RecentDocument";
import { QuickBookmarks } from "./_sections/QuickBookmark";
import {
  DashboardEmptyState,
  DashboardSkeleton,
} from "./_sections/DashboardStates";

// ── Dummy data (ganti dengan data asli) ─────────────────────────────────────
import {
  DUMMY_USER,
  DUMMY_DOCUMENTS,
  DUMMY_SESSIONS,
  DUMMY_BOOKMARKS,
} from "./types";
import type { BookmarkedItem } from "./types";

// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading] = useState(false); // → set true saat fetch data asli

  // ── Data source ────────────────────────────────────────────────────────────
  // Ganti dengan data asli dari hook/fetch/props:
  const user = DUMMY_USER;
  const allDocuments = DUMMY_DOCUMENTS;
  const sessions = DUMMY_SESSIONS;
  const bookmarks = DUMMY_BOOKMARKS;

  // ── Search filter ──────────────────────────────────────────────────────────
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return allDocuments;
    const q = searchQuery.toLowerCase();
    return allDocuments.filter((doc) =>
      doc.title.toLowerCase().includes(q)
    );
  }, [allDocuments, searchQuery]);

  // ── Handlers (sambungkan ke logic existing) ────────────────────────────────
  function handleUploadClick() {
    // → buka upload modal, router push, dsb.
    console.log("Upload triggered");
  }

  function handleDocumentClick(id: string) {
    // → router.push(`/documents/${id}`)
    console.log("Open document:", id);
  }

  function handleContinueLearning(documentId: string) {
    // → router.push(`/documents/${documentId}`)
    console.log("Continue learning:", documentId);
  }

  function handleBookmarkClick(item: BookmarkedItem) {
    // → router.push(`/documents/${item.documentId}`)
    console.log("Open bookmark:", item);
  }

  function handleViewAllDocuments() {
    // → router.push("/documents")
    console.log("View all documents");
  }

  function handleViewAllBookmarks() {
    // → router.push("/bookmarks")
    console.log("View all bookmarks");
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  const hasDocuments = allDocuments.length > 0;
  const hasSearchResults = filteredDocuments.length > 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex flex-col gap-8">

        {/* ── Greeting ──────────────────────────────────────────────────── */}
        <DashboardGreeting
          user={user}
          documentCount={allDocuments.length}
          onUploadClick={handleUploadClick}
        />

        {/* ── Search ────────────────────────────────────────────────────── */}
        {hasDocuments && (
          <DashboardSearch onSearch={setSearchQuery} />
        )}

        {/* ── Empty state — zero documents ──────────────────────────────── */}
        {!hasDocuments && (
          <DashboardEmptyState onUploadClick={handleUploadClick} />
        )}

        {/* ── Main content — when documents exist ───────────────────────── */}
        {hasDocuments && (
          <>
            {/* Upload CTA — lunak, tidak mendominasi */}
            {!searchQuery && (
              <UploadCtaCard onUploadClick={handleUploadClick} />
            )}

            {/* Continue Learning — hanya jika ada active session */}
            {!searchQuery && sessions.length > 0 && (
              <ContinueLearning
                sessions={sessions}
                onContinue={handleContinueLearning}
              />
            )}

            {/* Recent / Filtered Documents */}
            {hasSearchResults ? (
              <RecentDocuments
                documents={filteredDocuments}
                onDocumentClick={handleDocumentClick}
                onViewAll={handleViewAllDocuments}
              />
            ) : (
              /* Search: no results */
              <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 px-6 py-10 text-center">
                <p className="text-sm font-medium text-neutral-600">
                  No documents match &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Try a different keyword or upload a new PDF.
                </p>
              </div>
            )}

            {/* Bookmarks — hanya jika ada dan tidak sedang search */}
            {!searchQuery && bookmarks.length > 0 && (
              <QuickBookmarks
                items={bookmarks}
                onItemClick={handleBookmarkClick}
                onViewAll={handleViewAllBookmarks}
              />
            )}
          </>
        )}

      </div>
    </div>
  );
}