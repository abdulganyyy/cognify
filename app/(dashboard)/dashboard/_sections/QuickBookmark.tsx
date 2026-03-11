import { Bookmark, CreditCard, FileText, Layers, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { BookmarkedItem } from "../types";

// ─── Type icon map ────────────────────────────────────────────────────────────

const typeConfig: Record<
  BookmarkedItem["type"],
  { icon: React.ElementType; bg: string; iconClass: string; label: string }
> = {
  topic: {
    icon: Layers,
    bg: "bg-violet-50",
    iconClass: "text-violet-500",
    label: "Topic",
  },
  flashcard: {
    icon: CreditCard,
    bg: "bg-amber-50",
    iconClass: "text-amber-500",
    label: "Flashcard",
  },
  summary: {
    icon: FileText,
    bg: "bg-blue-50",
    iconClass: "text-blue-500",
    label: "Summary",
  },
};

// ─── Bookmark Row ─────────────────────────────────────────────────────────────

interface BookmarkRowProps {
  item: BookmarkedItem;
  onClick?: (item: BookmarkedItem) => void;
}

function BookmarkRow({ item, onClick }: BookmarkRowProps) {
  const cfg = typeConfig[item.type];
  const Icon = cfg.icon;

  return (
    <button
      type="button"
      onClick={() => onClick?.(item)}
      className="group flex w-full items-center gap-3 rounded-xl border border-neutral-100 bg-white px-4 py-3 text-left transition-all hover:border-neutral-200 hover:shadow-sm"
    >
      {/* Type icon */}
      <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", cfg.bg)}>
        <Icon className={cn("h-3.5 w-3.5", cfg.iconClass)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-neutral-700">{item.label}</p>
        <p className="mt-0.5 text-[11px] text-neutral-400">
          {cfg.label} · {item.documentTitle}
        </p>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden text-[11px] text-neutral-400 sm:block">{item.savedAt}</span>
        <ChevronRight className="h-3.5 w-3.5 text-neutral-300 transition-colors group-hover:text-neutral-500" />
      </div>
    </button>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface QuickBookmarksProps {
  items: BookmarkedItem[];
  onItemClick?: (item: BookmarkedItem) => void;
  onViewAll?: () => void;
}

/**
 * QuickBookmarks
 *
 * Daftar item yang di-bookmark: topik, flashcard, atau ringkasan.
 * Tidak tampil jika kosong.
 *
 * @example
 * <QuickBookmarks
 *   items={bookmarks}
 *   onItemClick={(item) => router.push(`/documents/${item.documentId}`)}
 * />
 */
export function QuickBookmarks({ items, onItemClick, onViewAll }: QuickBookmarksProps) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bookmark className="h-3.5 w-3.5 text-neutral-400" />
          <h2 className="text-sm font-semibold text-neutral-800">Bookmarks</h2>
        </div>
        {items.length > 3 && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors"
          >
            View all
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {items.slice(0, 4).map((item) => (
          <BookmarkRow key={item.id} item={item} onClick={onItemClick} />
        ))}
      </div>
    </section>
  );
}