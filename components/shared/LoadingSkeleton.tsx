import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

// ─── Primitive ────────────────────────────────────────────────────────────────
interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Skeleton
 * Blok animasi shimmer dasar. Gunakan langsung untuk custom layout.
 */

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-neutral-100", className)}
      {...props}
    />
  );
}

// ─── Preset: Document Card ─────────────────────────────────────────────────

/**
 * DocumentCardSkeleton
 * Skeleton untuk card dokumen (judul, deskripsi, badge status).
 *
 * @example
 * {isLoading && Array.from({ length: 4 }).map((_, i) => (
 *   <DocumentCardSkeleton key={i} />
 * ))}
 */
export function DocumentCardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-100 bg-white p-5 space-y-3",
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      {/* Description lines */}
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      {/* Footer */}
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

// ─── Preset: Topic List ────────────────────────────────────────────────────

/**
 * TopicListSkeleton
 * Skeleton untuk list topik (chip-chip kecil).
 *
 * @example
 * {isLoading && <TopicListSkeleton count={6} />}
 */
export function TopicListSkeleton({
  count = 5,
  className,
}: SkeletonProps & { count?: number }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-6 rounded-full"
          style={{ width: `${60 + (i % 3) * 24}px` }}
        />
      ))}
    </div>
  );
}

// ─── Preset: Text Block ────────────────────────────────────────────────────

/**
 * TextBlockSkeleton
 * Skeleton untuk konten teks panjang (mis. ringkasan dokumen).
 *
 * @example
 * {isLoading && <TextBlockSkeleton lines={4} />}
 */
export function TextBlockSkeleton({
  lines = 3,
  className,
}: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={{ width: i === lines - 1 ? "65%" : "100%" }}
        />
      ))}
    </div>
  );
}