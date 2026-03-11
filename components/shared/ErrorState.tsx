import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  /** Callback untuk tombol retry */
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/**
 * ErrorState
 *
 * Ditampilkan saat terjadi kesalahan fetch / proses AI gagal.
 * Opsional tombol retry.
 *
 * @example
 * <ErrorState
 *   title="Gagal memuat dokumen"
 *   message="Koneksi terputus. Coba lagi beberapa saat."
 *   onRetry={refetch}
 * />
 */
export function ErrorState({
  title = "Terjadi kesalahan",
  message = "Sesuatu tidak berjalan sebagaimana mestinya.",
  onRetry,
  retryLabel = "Coba lagi",
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "rounded-xl border border-red-100 bg-red-50/50",
        "px-8 py-12",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-center rounded-full bg-red-100 p-3 ring-1 ring-red-200">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>

      <p className="text-sm font-semibold text-neutral-800">{title}</p>

      <p className="mt-1.5 max-w-xs text-sm text-neutral-500 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-5 text-xs border-neutral-200 hover:border-neutral-300"
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}