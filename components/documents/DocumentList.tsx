import { FileText, Search, Upload } from "lucide-react";

import { DocumentCard, DocumentCardProps } from "@/components/documents/DocumentCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { DocumentCardSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface DocumentListProps {
  documents?: DocumentCardProps[];
  isLoading?: boolean;
  isError?: boolean;
  errorTitle?: string;
  errorDescription?: string;
  onRetry?: () => void;
  hasSearchQuery?: boolean;
  searchQuery?: string;
  onUploadClick?: () => void;
  className?: string;
}

export function DocumentList({
  documents = [],
  isLoading = false,
  isError = false,
  errorTitle,
  errorDescription,
  onRetry,
  hasSearchQuery = false,
  searchQuery,
  onUploadClick,
  className,
}: DocumentListProps) {
  if (isLoading) {
    return (
      <div className={cn("grid gap-3 md:grid-cols-2 xl:grid-cols-3", className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <DocumentCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        className={className}
        title={errorTitle ?? "Gagal memuat dokumen"}
        message={
          errorDescription ??
          "Terjadi kendala saat mengambil daftar dokumen. Coba lagi dalam beberapa saat."
        }
        onRetry={onRetry}
      />
    );
  }

  if (!documents.length) {
    if (hasSearchQuery) {
      return (
        <EmptyState
          className={className}
          icon={<Search className="h-5 w-5 text-blue-500" />}
          title={
            searchQuery
              ? `Tidak ada dokumen yang cocok dengan "${searchQuery}"`
              : "Dokumen tidak ditemukan"
          }
          description="Coba gunakan kata kunci judul lain atau unggah PDF baru."
        />
      );
    }

    return (
      <EmptyState
        className={className}
        icon={<FileText className="h-5 w-5 text-blue-500" />}
        title="Belum ada dokumen"
        description="Unggah materi PDF pertamamu untuk mulai membuat ringkasan, topik, flashcards, dan Tutor AI."
        action={
          onUploadClick ? (
            <Button
              type="button"
              size="sm"
              onClick={onUploadClick}
              className="gap-1.5 bg-blue-600 text-xs text-white hover:bg-blue-700"
            >
              <Upload className="h-3.5 w-3.5" />
              Unggah PDF pertamamu
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className={cn("grid gap-3 md:grid-cols-2 xl:grid-cols-3", className)}>
      {documents.map((document) => (
        <DocumentCard key={document.id} {...document} />
      ))}
    </div>
  );
}
