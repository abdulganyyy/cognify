import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Slot kanan — bisa berisi tombol, badge, dsb */
  actions?: ReactNode;
  /** Breadcrumb atau elemen navigasi di atas title */
  eyebrow?: ReactNode;
  className?: string;
}

/**
 * PageHeader
 *
 * Digunakan di bagian paling atas setiap halaman.
 * Layout: eyebrow (opsional) → title + description | actions
 *
 * @example
 * <PageHeader
 *   eyebrow={<Breadcrumb />}
 *   title="Documents"
 *   description="Semua PDF yang sudah kamu upload."
 *   actions={<Button size="sm">Upload PDF</Button>}
 * />
 */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "border-b border-neutral-100 bg-white px-6 py-5",
        className
      )}
    >
      {eyebrow && (
        <div className="mb-2 text-xs font-medium text-neutral-400 tracking-wide">
          {eyebrow}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-neutral-900 leading-tight tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-neutral-500 leading-relaxed max-w-xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}