"use client";

import Link from "next/link";
import {
  ChevronRight,
  ExternalLink,
  FileText,
  MoreHorizontal,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookmarkButton } from "@/components/shared/BookmarkButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TopicTag } from "@/components/shared/TopicTag";
import { cn } from "@/lib/utils/cn";

export type DocumentCardStatus =
  | "draft"
  | "uploaded"
  | "processing"
  | "ready"
  | "failed";

export interface DocumentCardTopic {
  id: string;
  label: string;
}

export interface DocumentCardProps {
  id: string;
  title: string;
  description?: string;
  updatedAt?: string;
  pageCount?: number;
  status: DocumentCardStatus;
  topics?: DocumentCardTopic[];
  bookmarked?: boolean;
  href?: string;
  className?: string;
  onBookmarkToggle?: () => void;
  onRetryProcess?: () => void;
  onDelete?: () => void;
  actionSlot?: React.ReactNode;
}

export function DocumentCard({
  id,
  title,
  description,
  updatedAt,
  pageCount,
  status,
  topics = [],
  bookmarked = false,
  href,
  className,
  onBookmarkToggle,
  onRetryProcess,
  onDelete,
  actionSlot,
}: DocumentCardProps) {
  const documentHref = href ?? `/documents/${id}`;
  const isReady = status === "ready";

  return (
    <article
      className={cn(
        "group flex flex-col justify-between rounded-xl border border-neutral-100 bg-white p-4",
        "transition-all duration-150 hover:border-neutral-200 hover:shadow-md hover:shadow-neutral-100/80",
        className
      )}
    >
      <div>
        {/* Top row */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex min-w-0 items-start gap-2.5">
            <div
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                isReady ? "bg-blue-50 text-blue-500" : "bg-neutral-100 text-neutral-400"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
            </div>

            <div className="min-w-0">
              <Link
                href={documentHref}
                className="line-clamp-1 text-sm font-medium leading-snug text-neutral-800 transition-colors hover:text-blue-600"
              >
                {title}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <StatusBadge status={status} />
                {typeof pageCount === "number" && (
                  <span className="text-[11px] text-neutral-400">
                    {pageCount} hal
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <BookmarkButton
              size="sm"
              isBookmarked={bookmarked}
              onToggle={onBookmarkToggle ? () => onBookmarkToggle() : undefined}
            />

            {actionSlot ?? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                    aria-label="Aksi dokumen"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 text-xs">
                  <DropdownMenuItem asChild className="cursor-pointer gap-2">
                    <Link href={documentHref}>
                      <ExternalLink className="h-3.5 w-3.5" />
                      Buka Dokumen
                    </Link>
                  </DropdownMenuItem>
                  {onRetryProcess && (
                    <DropdownMenuItem
                      onClick={onRetryProcess}
                      className="cursor-pointer gap-2"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Proses Ulang
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus Dokumen
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Summary / File Info */}
        {description && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-neutral-500">
            {description}
          </p>
        )}

        {/* Topic chips */}
        {topics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {topics.slice(0, 3).map((topic) => (
              <TopicTag key={topic.id} label={topic.label} variant="subtle" />
            ))}
            {topics.length > 3 && (
              <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-xs font-medium leading-none text-neutral-500">
                +{topics.length - 3} lainnya
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-2.5">
        <span className="text-[11px] text-neutral-400">
          {updatedAt ? `Diperbarui ${updatedAt}` : ""}
        </span>
        <Link
          href={documentHref}
          className="inline-flex items-center gap-0.5 text-[11px] font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          Buka
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}
