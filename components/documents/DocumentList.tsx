import { FileText } from "lucide-react";

import { DocumentCard, DocumentCardProps } from "@/components/documents/DocumentCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { DocumentCardSkeleton } from "@/components/shared/LoadingSkeleton";
import { cn } from "@/lib/utils/cn";

export interface DocumentListProps {
	documents?: DocumentCardProps[];
	isLoading?: boolean;
	isError?: boolean;
	errorTitle?: string;
	errorDescription?: string;
	onRetry?: () => void;
	className?: string;
}

export function DocumentList({ documents = [], isLoading = false, isError = false, errorTitle, errorDescription, onRetry, className }: DocumentListProps) {
	if (isLoading) {
		return (
			<div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>
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
				message={errorDescription ?? "Terjadi kendala saat mengambil daftar dokumen. Coba lagi dalam beberapa saat."}
				onRetry={onRetry}
			/>
		);
	}

	if (!documents.length) {
		return (
			<EmptyState
				className={className}
				icon={<FileText className="h-5 w-5" />}
				title="Belum ada dokumen"
				description="Unggah materi pertamamu untuk mulai membuat ringkasan, topik, dan flashcards."
			/>
		);
	}

	return (
		<div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>
			{documents.map((document) => (
				<DocumentCard
					key={document.id}
					{...document}
				/>
			))}
		</div>
	);
}
