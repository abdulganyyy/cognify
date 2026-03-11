"use client";

import { useRef, ChangeEvent } from "react";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

interface UploadTriggerButtonProps {
  /** Dipanggil setelah user memilih file */
  onFileSelect: (file: File) => void | Promise<void>;
  /** Tipe file yang diterima, default PDF */
  accept?: string;
  /** Ukuran maks dalam MB, default 10 */
  maxSizeMb?: number;
  /** Tampilkan state loading */
  isLoading?: boolean;
  /** Disable tombol */
  disabled?: boolean;
  /** Label tombol */
  label?: string;
  /** Variant Shadcn Button */
  variant?: "default" | "outline" | "ghost" | "secondary";
  /** Ukuran Shadcn Button */
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

/**
 * UploadTriggerButton
 *
 * Tombol yang memicu file picker browser.
 * Menangani validasi tipe & ukuran file.
 * TIDAK melakukan upload ke server — hanya memanggil `onFileSelect`.
 *
 * @example
 * <UploadTriggerButton
 *   onFileSelect={(file) => handleUpload(file)}
 *   isLoading={isUploading}
 *   maxSizeMb={10}
 * />
 */
export function UploadTriggerButton({
  onFileSelect,
  accept = ".pdf,application/pdf",
  maxSizeMb = 10,
  isLoading = false,
  disabled = false,
  label = "Upload PDF",
  variant = "default",
  size = "default",
  className,
}: UploadTriggerButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (isLoading || disabled) return;
    inputRef.current?.click();
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset supaya onChange tetap trigger jika file sama dipilih ulang
    e.target.value = "";

    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      // Biarkan parent/toast yang menampilkan error
      console.warn(`[UploadTriggerButton] File terlalu besar: ${file.size} bytes`);
      return;
    }

    await onFileSelect(file);
  };

  return (
    <>
      {/* Input tersembunyi — tidak dirender secara visual */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      <Button
        variant={variant}
        size={size}
        disabled={isLoading || disabled}
        onClick={handleClick}
        aria-label={label}
        className={cn(
          "gap-2 font-medium transition-all",
          variant === "default" &&
            "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200",
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {label}
      </Button>
    </>
  );
}