import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

// ─── Empty State ──────────────────────────────────────────────────────────────

interface DashboardEmptyStateProps {
  onUploadClick?: () => void;
}

/**
 * DashboardEmptyState
 *
 * Tampil ketika user belum punya dokumen apapun.
 * Mengambil alih area konten dengan CTA yang jelas.
 *
 * @example
 * {documents.length === 0 && <DashboardEmptyState onUploadClick={...} />}
 */
export function DashboardEmptyState({ onUploadClick }: DashboardEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/60 px-8 py-16 text-center">
      <div className="mb-5 flex items-center justify-center rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
        <FileText className="h-7 w-7 text-blue-400" />
      </div>

      <p className="text-sm font-semibold text-neutral-700">No documents yet</p>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-neutral-500">
        Upload your first PDF and Cognify will turn it into summaries, topics,
        flashcards, and an AI tutor.
      </p>

      <Button
        onClick={onUploadClick}
        size="sm"
        className="mt-6 h-9 gap-2 bg-blue-600 px-5 text-xs font-medium text-white hover:bg-blue-700 shadow-sm shadow-blue-100"
      >
        <Upload className="h-3.5 w-3.5" />
        Upload your first PDF
      </Button>

      {/* Visual hint: feature pills */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {["AI Summary", "Key Topics", "Flashcards", "Document Chat"].map((f) => (
          <span
            key={f}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-medium text-neutral-500"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton Primitives ──────────────────────────────────────────────────────

function Bone({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-neutral-100", className)} />
  );
}

// ─── Section Skeletons ────────────────────────────────────────────────────────

/** Skeleton untuk 1 document card */
function DocumentCardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Bone className="h-7 w-7 rounded-lg" />
          <Bone className="h-3.5 w-32" />
        </div>
        <Bone className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Bone className="h-3 w-16" />
        <Bone className="h-3 w-16" />
      </div>
      <Bone className="h-3 w-24" />
    </div>
  );
}

/** Skeleton untuk 1 session card */
function SessionCardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-5 space-y-4">
      <div className="flex items-start gap-3">
        <Bone className="h-8 w-8 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Bone className="h-3.5 w-3/4" />
          <Bone className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex gap-3">
        <Bone className="h-3 w-16" />
        <Bone className="h-3 w-16" />
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <Bone className="h-3 w-12" />
          <Bone className="h-3 w-8" />
        </div>
        <Bone className="h-1.5 w-full rounded-full" />
      </div>
      <Bone className="h-8 w-full rounded-xl" />
    </div>
  );
}

/** Skeleton untuk 1 bookmark row */
function BookmarkRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white px-4 py-3">
      <Bone className="h-7 w-7 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <Bone className="h-3 w-2/3" />
        <Bone className="h-2.5 w-1/3" />
      </div>
      <Bone className="h-3.5 w-3.5 rounded" />
    </div>
  );
}

// ─── Full Dashboard Skeleton ──────────────────────────────────────────────────

/**
 * DashboardSkeleton
 *
 * Loading skeleton untuk seluruh halaman dashboard.
 * Tampil saat data sedang di-fetch.
 *
 * @example
 * {isLoading ? <DashboardSkeleton /> : <DashboardContent />}
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Greeting skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Bone className="h-6 w-48" />
          <Bone className="h-4 w-64" />
        </div>
        <Bone className="h-9 w-28 rounded-xl" />
      </div>

      {/* Search skeleton */}
      <Bone className="h-10 w-full rounded-xl" />

      {/* Upload CTA skeleton */}
      <Bone className="h-24 w-full rounded-2xl" />

      {/* Continue Learning skeleton */}
      <div className="space-y-4">
        <Bone className="h-4 w-36" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SessionCardSkeleton />
          <SessionCardSkeleton />
        </div>
      </div>

      {/* Recent Documents skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Bone className="h-4 w-36" />
          <Bone className="h-3.5 w-14" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <DocumentCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Bookmarks skeleton */}
      <div className="space-y-4">
        <Bone className="h-4 w-28" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <BookmarkRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}