import {
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowUpCircle,
  ChevronRight,
  Layers,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Document, DocumentStatus } from "../types";

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<
  DocumentStatus,
  { label: string; icon: React.ElementType; iconClass: string; badgeClass: string; dotClass: string; pulse?: boolean }
> = {
  ready: {
    label: "Ready",
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotClass: "bg-emerald-400",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    iconClass: "text-amber-500 animate-spin",
    badgeClass: "bg-amber-50 text-amber-600 border-amber-200",
    dotClass: "bg-amber-400",
    pulse: true,
  },
  uploading: {
    label: "Uploading",
    icon: ArrowUpCircle,
    iconClass: "text-sky-500",
    badgeClass: "bg-sky-50 text-sky-600 border-sky-200",
    dotClass: "bg-sky-400",
    pulse: true,
  },
  failed: {
    label: "Failed",
    icon: AlertCircle,
    iconClass: "text-red-500",
    badgeClass: "bg-red-50 text-red-600 border-red-200",
    dotClass: "bg-red-400",
  },
};

// ─── Document Card ────────────────────────────────────────────────────────────

interface DocumentCardProps {
  document: Document;
  onClick?: (id: string) => void;
}

function DocumentCard({ document: doc, onClick }: DocumentCardProps) {
  const cfg = statusConfig[doc.status];
  const StatusIcon = cfg.icon;
  const isReady = doc.status === "ready";

  return (
    <button
      type="button"
      onClick={() => onClick?.(doc.id)}
      disabled={!isReady && doc.status !== "failed"}
      className={cn(
        "group w-full text-left rounded-xl border border-neutral-100 bg-white p-4",
        "transition-all duration-150",
        isReady && "hover:border-neutral-200 hover:shadow-md hover:shadow-neutral-100/80 cursor-pointer",
        !isReady && "cursor-default opacity-80"
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Icon + Title */}
        <div className="flex items-start gap-2.5 min-w-0">
          <div className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
            isReady ? "bg-blue-50" : "bg-neutral-100"
          )}>
            <FileText className={cn("h-3.5 w-3.5", isReady ? "text-blue-500" : "text-neutral-400")} />
          </div>
          <p className="truncate text-sm font-medium text-neutral-800 leading-snug pt-0.5">
            {doc.title}
          </p>
        </div>

        {/* Status badge */}
        <span className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0",
          cfg.badgeClass
        )}>
          <span className={cn("relative flex h-1.5 w-1.5")}>
            {cfg.pulse && (
              <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping", cfg.dotClass)} />
            )}
            <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", cfg.dotClass)} />
          </span>
          {cfg.label}
        </span>
      </div>

      {/* Stats row */}
      {isReady && (
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Layers className="h-3 w-3 text-neutral-400" />
            {doc.topicCount} topics
          </div>
          <div className="h-3 w-px bg-neutral-200" />
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <CreditCard className="h-3 w-3 text-neutral-400" />
            {doc.flashcardCount} cards
          </div>
        </div>
      )}

      {doc.status === "processing" && (
        <p className="mb-3 text-xs text-neutral-400">
          AI is generating your learning materials…
        </p>
      )}
      {doc.status === "failed" && (
        <p className="mb-3 text-xs text-red-500">
          Processing failed. Please re-upload.
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-neutral-400">{doc.updatedAt}</span>
        {isReady && (
          <span className={cn(
            "flex items-center gap-0.5 text-[11px] font-medium text-blue-500",
            "opacity-0 group-hover:opacity-100 transition-opacity"
          )}>
            Open
            <ChevronRight className="h-3 w-3" />
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface RecentDocumentsProps {
  documents: Document[];
  onDocumentClick?: (id: string) => void;
  onViewAll?: () => void;
}

/**
 * RecentDocuments
 *
 * Grid card dokumen terbaru.
 *
 * @example
 * <RecentDocuments
 *   documents={documents.slice(0, 6)}
 *   onDocumentClick={(id) => router.push(`/documents/${id}`)}
 *   onViewAll={() => router.push("/documents")}
 * />
 */
export function RecentDocuments({
  documents,
  onDocumentClick,
  onViewAll,
}: RecentDocumentsProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-800">Recent Documents</h2>
        {documents.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors"
          >
            View all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onClick={onDocumentClick}
          />
        ))}
      </div>
    </section>
  );
}