"use client";

import Link from "next/link";
import { ExternalLink, FileText, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";

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

  return (
    <article
      className={cn(
        "group rounded-2xl border border-border/60 bg-background p-5 shadow-sm transition-all hover:border-border hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-muted-foreground">
            <FileText className="h-5 w-5" />
          </div>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={status} />
            </div>

            <div className="space-y-1">
              <Link
                href={documentHref}
                className="line-clamp-1 text-base font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
              >
                {title}
              </Link>

              {description ? (
                <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <BookmarkButton
            isBookmarked={bookmarked}
            onToggle={onBookmarkToggle ? () => onBookmarkToggle() : undefined}
          />

          {actionSlot ?? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Aksi dokumen"
                >
                  <MoreHorizontal className="h-4 w-4" />
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

      <div className="mt-5 space-y-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {updatedAt ? <span>Diperbarui {updatedAt}</span> : null}
          {typeof pageCount === "number" ? <span>{pageCount} halaman</span> : null}
        </div>

        {topics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {topics.slice(0, 3).map((topic) => (
              <TopicTag key={topic.id} label={topic.label} />
            ))}

            {topics.length > 3 ? (
              <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground">
                +{topics.length - 3} lainnya
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="pt-1">
          <Link
            href={documentHref}
            className="inline-flex items-center text-sm font-medium text-primary transition-opacity hover:opacity-80"
          >
            Lihat detail
          </Link>
        </div>
      </div>
    </article>
  );
}
