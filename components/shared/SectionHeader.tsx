import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface SectionHeaderProps {
  title: string;
  description?: string;
  /** Aksi atau link di sisi kanan (mis. "Lihat semua") */
  trailing?: ReactNode;
  /** Ukuran judul */
  size?: "sm" | "md";
  className?: string;
}

/**
 * SectionHeader
 *
 * Digunakan untuk memisahkan grup konten di dalam halaman —
 * bukan sebagai page title.
 *
 * @example
 * <SectionHeader
 *   title="Topik Utama"
 *   description="Topik yang dihasilkan dari dokumenmu."
 *   trailing={<Button variant="ghost" size="sm">Lihat semua</Button>}
 * />
 */
export function SectionHeader({
  title,
  description,
  trailing,
  size = "md",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3 mb-4", className)}>
      <div>
        <h2
          className={cn(
            "font-semibold text-neutral-800 leading-snug",
            size === "md" && "text-base",
            size === "sm" && "text-sm"
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-neutral-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {trailing && (
        <div className="shrink-0 mt-0.5">{trailing}</div>
      )}
    </div>
  );
}