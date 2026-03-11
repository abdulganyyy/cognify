import { FileText, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { DocumentItem } from "./AppShell";

interface SidebarDocumentItemProps {
  document: DocumentItem;
  isActive?: boolean;
  onClick?: () => void;
}

// Status dot styles
const statusDot: Record<DocumentItem["status"], string> = {
  ready: "bg-emerald-400",
  processing: "bg-amber-400 animate-pulse",
  uploading: "bg-sky-400 animate-pulse",
  failed: "bg-red-400",
};

/**
 * SidebarDocumentItem
 *
 * Satu baris dokumen di dalam sidebar.
 * Menampilkan judul, status dot, dan jumlah topik jika tersedia.
 *
 * @example
 * <SidebarDocumentItem
 *   document={{ id: "1", title: "Buku Kalkulus", status: "ready", updatedAt: "2h ago", topicCount: 8 }}
 *   isActive={true}
 *   onClick={() => router.push("/documents/1")}
 * />
 */
export function SidebarDocumentItem({
  document,
  isActive = false,
  onClick,
}: SidebarDocumentItemProps) {
  const isProcessing =
    document.status === "processing" || document.status === "uploading";
  const isFailed = document.status === "failed";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-lg px-2.5 py-2 text-left transition-colors",
        "flex items-start gap-2.5",
        isActive
          ? "bg-blue-50 text-blue-700"
          : "hover:bg-neutral-50 text-neutral-600 hover:text-neutral-800"
      )}
    >
      {/* File Icon */}
      <div
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded",
          isActive ? "bg-blue-100" : "bg-neutral-100 group-hover:bg-neutral-200"
        )}
      >
        {isProcessing ? (
          <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
        ) : isFailed ? (
          <AlertCircle className="h-3 w-3 text-red-400" />
        ) : (
          <FileText
            className={cn(
              "h-3 w-3",
              isActive ? "text-blue-500" : "text-neutral-400"
            )}
          />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-xs font-medium leading-snug",
            isActive ? "text-blue-700" : "text-neutral-700"
          )}
        >
          {document.title}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          {/* Status dot */}
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full",
              statusDot[document.status]
            )}
          />
          <span className="text-[10px] text-neutral-400 truncate">
            {document.status === "processing"
              ? "Memproses…"
              : document.status === "uploading"
              ? "Uploading…"
              : document.status === "failed"
              ? "Gagal"
              : document.updatedAt}
          </span>
          {document.topicCount !== undefined && document.status === "ready" && (
            <>
              <span className="text-[10px] text-neutral-300">·</span>
              <span className="text-[10px] text-neutral-400">
                {document.topicCount} topik
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}