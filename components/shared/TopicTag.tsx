import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type TopicTagVariant = "default" | "active" | "subtle";

interface TopicTagProps {
  label: string;
  /** Icon kecil opsional di kiri */
  icon?: ReactNode;
  variant?: TopicTagVariant;
  /** Jika ada handler, chip jadi clickable */
  onClick?: () => void;
  className?: string;
}

const variantStyles: Record<TopicTagVariant, string> = {
  default:
    "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-150",
  active:
    "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  subtle:
    "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50",
};

/**
 * TopicTag
 *
 * Chip kecil untuk menampilkan topik / label kategori.
 * Bisa interactive (onClick) atau dekoratif saja.
 *
 * @example
 * // Dekoratif
 * <TopicTag label="Machine Learning" />
 *
 * // Aktif / terpilih
 * <TopicTag label="Machine Learning" variant="active" />
 *
 * // Clickable filter
 * <TopicTag label="Machine Learning" onClick={() => setFilter("ml")} />
 *
 * // Dengan icon
 * import { Hash } from "lucide-react";
 * <TopicTag label="Neural Networks" icon={<Hash className="w-3 h-3" />} />
 */
export function TopicTag({
  label,
  icon,
  variant = "default",
  onClick,
  className,
}: TopicTagProps) {
  const isInteractive = Boolean(onClick);

  const base = cn(
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5",
    "text-xs font-medium leading-none transition-colors",
    variantStyles[variant],
    isInteractive && "cursor-pointer select-none",
    !isInteractive && "cursor-default",
    className
  );

  if (isInteractive) {
    return (
      <button type="button" onClick={onClick} className={base}>
        {icon}
        {label}
      </button>
    );
  }

  return (
    <span className={base}>
      {icon}
      {label}
    </span>
  );
}