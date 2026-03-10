import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";

import { DocumentDetailHeader } from "@/components/documents/DocumentDetailHeader";
import { DocumentSummaryCard } from "@/components/documents/DocumentSummaryCard";
import { DocumentTopicsSection } from "@/components/documents/DocumentTopicsSection";
import { SectionHeader } from "@/components/shared/SectionHeader";

interface DocumentDetailPageProps {
	params: {
		documentId: string;
	};
}

const mockDocument = {
	id: "doc-1",
	title: "Pengantar Machine Learning",
	description: "Dokumen pembelajaran dasar tentang supervised learning, unsupervised learning, evaluasi model, dan alur kerja machine learning modern.",
	status: "ready" as const,
	updatedAt: "2 jam lalu",
	pageCount: 42,
	bookmarked: true,
	summary:
		"Dokumen ini membahas fondasi machine learning mulai dari definisi umum, jenis-jenis pendekatan, hingga alur evaluasi model.\n\nBagian awal menjelaskan perbedaan supervised learning dan unsupervised learning, lalu dilanjutkan dengan contoh tugas seperti classification dan clustering. Setelah itu, dokumen menyoroti pentingnya dataset splitting, metrik evaluasi, serta proses iterasi model.\n\nDi bagian akhir, materi menekankan bahwa kualitas model tidak hanya ditentukan oleh algoritma, tetapi juga oleh kualitas data, feature engineering, dan evaluasi yang konsisten.",
	topics: [
		{
			id: "topic-1",
			label: "Supervised Learning",
			description: "Pendekatan pembelajaran dengan data berlabel untuk memprediksi output tertentu.",
		},
		{
			id: "topic-2",
			label: "Unsupervised Learning",
			description: "Pendekatan untuk menemukan pola atau struktur tersembunyi tanpa label eksplisit.",
		},
		{
			id: "topic-3",
			label: "Classification",
			description: "Tugas prediksi kategori atau kelas berdasarkan input tertentu.",
		},
		{
			id: "topic-4",
			label: "Model Evaluation",
			description: "Proses mengukur performa model menggunakan metrik dan validasi yang tepat.",
		},
	],
};

function ProcessingOverview({ status }: { status: "draft" | "uploaded" | "processing" | "ready" | "failed" }) {
	const items = [
		{
			label: "Dokumen diunggah",
			done: status === "uploaded" || status === "processing" || status === "ready",
		},
		{
			label: "Ekstraksi konten",
			done: status === "processing" || status === "ready",
		},
		{
			label: "Analisis topik & ringkasan",
			done: status === "ready",
		},
	];

	return (
		<section className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm sm:p-6">
			<SectionHeader
				title="Status Proses"
				description="Gambaran singkat tahapan pemrosesan dokumen."
			/>

			<div className="mt-5 space-y-3">
				{status === "failed" ? (
					<div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/70 p-4 dark:border-red-950 dark:bg-red-950/20">
						<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
						<div>
							<p className="text-sm font-medium text-foreground">Pemrosesan dokumen gagal</p>
							<p className="mt-1 text-sm leading-6 text-muted-foreground">Dokumen belum berhasil dianalisis. Nantinya bagian ini bisa kamu hubungkan ke status asli dari backend.</p>
						</div>
					</div>
				) : (
					items.map((item) => (
						<div
							key={item.label}
							className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4"
						>
							{item.done ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" /> : <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />}

							<div>
								<p className="text-sm font-medium text-foreground">{item.label}</p>
								<p className="mt-1 text-sm text-muted-foreground">{item.done ? "Selesai" : "Menunggu atau sedang diproses"}</p>
							</div>
						</div>
					))
				)}
			</div>
		</section>
	);
}

export default function DocumentDetailPage({ params }: DocumentDetailPageProps) {
	const document = {
		...mockDocument,
		id: params.documentId,
	};

	return (
		<div className="space-y-6">
			<DocumentDetailHeader
				title={document.title}
				description={document.description}
				status={document.status}
				updatedAt={document.updatedAt}
				pageCount={document.pageCount}
				bookmarked={document.bookmarked}
			/>

			<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
				<div className="space-y-6">
					<DocumentSummaryCard summary={document.summary} />
					<DocumentTopicsSection topics={document.topics} />
				</div>

				<div className="space-y-6">
					<ProcessingOverview status={document.status} />
				</div>
			</div>
		</div>
	);
}
