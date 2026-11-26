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
 * Header halaman yang menyatu langsung dengan kanvas konten (tanpa box bertumpuk di bawah AppTopbar).
 * Layout: eyebrow (opsional) → title + description | actions
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
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            {eyebrow}
          </div>
        )}
        <h1 className="text-xl font-semibold leading-tight tracking-tight text-neutral-900">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-neutral-500">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
}