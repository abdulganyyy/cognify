import Link from "next/link";
import {
  ChevronLeft,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { BookmarkButton } from "@/components/shared/BookmarkButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";

export type DocumentDetailStatus =
  | "draft"
  | "uploaded"
  | "processing"
  | "ready"
  | "failed";

export interface DocumentDetailHeaderProps {
  title: string;
  description?: string;
  status: DocumentDetailStatus;
  updatedAt?: string;
  pageCount?: number;
  bookmarked?: boolean;
  onBookmarkToggle?: () => void;
  backHref?: string;
  onRename?: () => void;
  onRetryProcess?: () => void;
  onDelete?: () => void;
  isProcessing?: boolean;
  tabsSlot?: React.ReactNode;
  chatOpen?: boolean;
  onToggleChat?: () => void;
  className?: string;
}

export function DocumentDetailHeader({
  title,
  description,
  status,
  updatedAt,
  pageCount,
  bookmarked = false,
  onBookmarkToggle,
  backHref = "/documents",
  onRename,
  onRetryProcess,
  onDelete,
  isProcessing = false,
  tabsSlot,
  chatOpen = true,
  onToggleChat,
  className,
}: DocumentDetailHeaderProps) {
  return (
    <div
      className={cn(
        "shrink-0 border-b border-neutral-100 bg-white px-4 py-2.5 sm:px-5",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Left: Back + Title + Status */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Kembali ke Dokumen"
          >
            <Link href={backHref}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <h1 className="truncate text-sm font-semibold tracking-tight text-neutral-800">
                {title}
              </h1>
              <StatusBadge status={status} className="shrink-0" />
            </div>

            {(description || updatedAt || typeof pageCount === "number") && (
              <p className="mt-0.5 truncate text-[11px] text-neutral-400">
                {[
                  typeof pageCount === "number" ? `${pageCount} halaman` : null,
                  updatedAt ? `Diperbarui ${updatedAt}` : null,
                  description,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>

        {/* Right: Pill tabs (desktop) + Actions */}
        <div className="flex w-full items-center justify-between gap-2 lg:w-auto lg:justify-end">
          {tabsSlot && <div className="overflow-x-auto">{tabsSlot}</div>}

          <div className="flex shrink-0 items-center gap-1">
            {status === "failed" && onRetryProcess && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={onRetryProcess}
                className="h-7 gap-1.5 rounded-lg border-neutral-200 px-2.5 text-xs"
              >
                {isProcessing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Proses Ulang
              </Button>
            )}

            <BookmarkButton
              size="sm"
              isBookmarked={bookmarked}
              onToggle={onBookmarkToggle ? () => onBookmarkToggle() : undefined}
            />

            {onToggleChat && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onToggleChat}
                className={cn(
                  "hidden h-7 gap-1.5 rounded-lg px-2.5 text-xs font-medium lg:inline-flex",
                  chatOpen
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                )}
                aria-pressed={chatOpen}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Tutor AI
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                  aria-label="Aksi dokumen"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs">
                {onRename && (
                  <DropdownMenuItem onClick={onRename} className="cursor-pointer gap-2">
                    <Pencil className="h-3.5 w-3.5" />
                    Ubah Judul
                  </DropdownMenuItem>
                )}
                {onRetryProcess && (
                  <DropdownMenuItem
                    disabled={isProcessing}
                    onClick={onRetryProcess}
                    className="cursor-pointer gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    Proses Ulang AI
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
          </div>
        </div>
      </div>
    </div>
  );
}