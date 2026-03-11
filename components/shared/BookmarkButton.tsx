"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BookmarkButtonProps {
  /** State awal (controlled dari parent/server) */
  isBookmarked?: boolean;
  /** Dipanggil ketika toggle; terima state terbaru */
  onToggle?: (next: boolean) => void | Promise<void>;
  /** Ukuran tombol */
  size?: "sm" | "md";
  /** Disabled saat sedang loading/save */
  disabled?: boolean;
  className?: string;
}

/**
 * BookmarkButton
 *
 * Tombol icon untuk bookmark/unbookmark konten.
 * Punya optimistic UI — langsung update visual sebelum async selesai.
 *
 * @example
 * <BookmarkButton
 *   isBookmarked={doc.isBookmarked}
 *   onToggle={(next) => saveBookmark(doc.id, next)}
 * />
 */
export function BookmarkButton({
  isBookmarked = false,
  onToggle,
  size = "md",
  disabled = false,
  className,
}: BookmarkButtonProps) {
  const [optimistic, setOptimistic] = useState(isBookmarked);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    if (isPending || disabled) return;
    const next = !optimistic;
    setOptimistic(next); // optimistic update
    setIsPending(true);
    try {
      await onToggle?.(next);
    } catch {
      setOptimistic(!next); // rollback on error
    } finally {
      setIsPending(false);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            onClick={handleToggle}
            disabled={isPending || disabled}
            aria-label={optimistic ? "Hapus bookmark" : "Tambah bookmark"}
            aria-pressed={optimistic}
            className={cn(
              "rounded-lg transition-all",
              size === "sm" ? "h-7 w-7 p-0" : "h-8 w-8 p-0",
              optimistic
                ? "text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100",
              className
            )}
          >
            <Bookmark
              className={cn(
                "transition-all",
                size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
                optimistic && "fill-current"
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {optimistic ? "Hapus bookmark" : "Tambah bookmark"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}