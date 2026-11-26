import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface SectionHeaderProps {
  title: string;
  description?: string;
  /** Icon kecil opsional di kiri judul */
  icon?: ReactNode;
  /** Aksi atau link di sisi kanan (mis. "Lihat semua") */
  trailing?: ReactNode;
  /** Ukuran judul */
  size?: "sm" | "md";
  /** Gaya label: default (judul biasa) atau label (uppercase compact ala DashboardPreview) */
  variant?: "default" | "label";
  className?: string;
}

/**
 * SectionHeader
 *
 * Digunakan untuk memisahkan grup konten di dalam halaman atau card.
 */
export function SectionHeader({
  title,
  description,
  icon,
  trailing,
  size = "md",
  variant = "default",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          {icon}
          <h2
            className={cn(
              variant === "label"
                ? "text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                : cn(
                    "font-semibold leading-snug text-neutral-800",
                    size === "md" && "text-sm",
                    size === "sm" && "text-xs"
                  )
            )}
          >
            {title}
          </h2>
        </div>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-neutral-400">
            {description}
          </p>
        )}
      </div>

      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}