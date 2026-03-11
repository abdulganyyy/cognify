import { cn } from "@/lib/utils/cn";

// ─── Tipe status dokumen ───────────────────────────────────────────────────

export type DocumentStatus =
  | "processing"
  | "ready"
  | "failed"
  | "uploading"
  | "draft";

interface StatusBadgeProps {
  status: DocumentStatus;
  /** Tampilkan tanpa dot indicator */
  noDot?: boolean;
  className?: string;
}

// ─── Config per status ─────────────────────────────────────────────────────

const config: Record<
  DocumentStatus,
  { label: string; badge: string; dot: string; pulse?: boolean }
> = {
  uploading: {
    label: "Uploading",
    badge: "bg-sky-50 text-sky-600 border-sky-200",
    dot: "bg-sky-400",
    pulse: true,
  },
  processing: {
    label: "Memproses",
    badge: "bg-amber-50 text-amber-600 border-amber-200",
    dot: "bg-amber-400",
    pulse: true,
  },
  ready: {
    label: "Siap",
    badge: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dot: "bg-emerald-400",
  },
  failed: {
    label: "Gagal",
    badge: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-400",
  },
  draft: {
    label: "Draft",
    badge: "bg-neutral-100 text-neutral-500 border-neutral-200",
    dot: "bg-neutral-400",
  },
};

/**
 * StatusBadge
 *
 * Badge yang menampilkan status proses dokumen.
 * Status "processing" dan "uploading" menampilkan dot animasi pulse.
 *
 * @example
 * <StatusBadge status="processing" />
 * <StatusBadge status="ready" />
 * <StatusBadge status="failed" noDot />
 */
export function StatusBadge({ status, noDot = false, className }: StatusBadgeProps) {
  const { label, badge, dot, pulse } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5",
        "text-xs font-medium leading-none",
        badge,
        className
      )}
    >
      {!noDot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                dot
              )}
            />
          )}
          <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", dot)} />
        </span>
      )}
      {label}
    </span>
  );
}