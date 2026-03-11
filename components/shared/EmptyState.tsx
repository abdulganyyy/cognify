import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  /** Icon SVG / Lucide node */
  icon?: ReactNode;
  title: string;
  description?: string;
  /** CTA utama (mis. tombol Upload) */
  action?: ReactNode;
  className?: string;
}

/**
 * EmptyState
 *
 * Ditampilkan saat suatu list/konten kosong.
 * Bisa digunakan di halaman Documents, Flashcards, Bookmarks, dsb.
 *
 * @example
 * import { FileText } from "lucide-react";
 *
 * <EmptyState
 *   icon={<FileText className="w-8 h-8 text-blue-400" />}
 *   title="Belum ada dokumen"
 *   description="Upload PDF pertamamu untuk mulai belajar."
 *   action={<Button size="sm">Upload PDF</Button>}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "rounded-xl border border-dashed border-neutral-200",
        "bg-neutral-50/60 px-8 py-14",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex items-center justify-center rounded-full bg-blue-50 p-3 ring-1 ring-blue-100">
          {icon}
        </div>
      )}

      <p className="text-sm font-semibold text-neutral-700">{title}</p>

      {description && (
        <p className="mt-1.5 max-w-xs text-sm text-neutral-500 leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}