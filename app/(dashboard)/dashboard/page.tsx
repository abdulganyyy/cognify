import { BookOpen, Clock3, FileText, Sparkles, TrendingUp, Upload } from "lucide-react";

import { DocumentList } from "@/components/documents/DocumentList";
import type { DocumentCardProps } from "@/components/documents/DocumentCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UploadTriggerButton } from "@/components/shared/UploadTriggerButton";
import { cn } from "@/lib/utils/cn";

interface OverviewStatCardProps {
	title: string;
	value: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
}

function OverviewStatCard({ title, value, description, icon: Icon }: OverviewStatCardProps) {
	return (
		<div className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm">
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-1">
					<p className="text-sm font-medium text-muted-foreground">{title}</p>
					<p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
				</div>

				<div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-muted-foreground">
					<Icon className="h-5 w-5" />
				</div>
			</div>

			<p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>
		</div>
	);
}

interface QuickActionCardProps {
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	href?: string;
	className?: string;
}

function QuickActionCard({ title, description, icon: Icon, href = "#", className }: QuickActionCardProps) {
	return (
		<a
			href={href}
			className={cn("group block rounded-2xl border border-border/60 bg-background p-5 shadow-sm transition-all hover:border-border hover:shadow-md", className)}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-2">
					<div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-muted-foreground transition-colors group-hover:text-primary">
						<Icon className="h-5 w-5" />
					</div>

					<div>
						<p className="text-base font-semibold tracking-tight text-foreground">{title}</p>
						<p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
					</div>
				</div>

				<span className="text-sm font-medium text-primary">Buka</span>
			</div>
		</a>
	);
}

const recentDocuments: DocumentCardProps[] = [
	{
		id: "doc-1",
		title: "Pengantar Machine Learning",
		description: "Ringkasan konsep dasar supervised learning, unsupervised learning, dan evaluasi model.",
		status: "ready",
		updatedAt: "2 jam lalu",
		pageCount: 42,
		bookmarked: true,
		topics: [
			{ id: "t-1", label: "Supervised Learning" },
			{ id: "t-2", label: "Evaluation" },
			{ id: "t-3", label: "Classification" },
		],
	},
	{
		id: "doc-2",
		title: "Linear Algebra for AI",
		description: "Vektor, matriks, eigenvalues, dan fondasi matematis untuk machine learning.",
		status: "processing",
		updatedAt: "Hari ini",
		pageCount: 67,
		topics: [
			{ id: "t-4", label: "Vectors" },
			{ id: "t-5", label: "Matrices" },
		],
	},
	{
		id: "doc-3",
		title: "Statistika Dasar",
		description: "Probabilitas, distribusi, mean, variance, dan pengantar inferensi statistik.",
		status: "uploaded",
		updatedAt: "Kemarin",
		pageCount: 29,
		topics: [{ id: "t-6", label: "Probability" }],
	},
];

export default function DashboardPage() {
	return (
		<div className="space-y-8">
			<PageHeader
				eyebrow="Overview"
				title="Dashboard"
				description="Pantau dokumen terbaru, status proses, dan aktivitas belajar secara ringkas dalam satu tempat."
			/>

			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<OverviewStatCard
					title="Total Dokumen"
					value="24"
					description="Seluruh materi yang sudah tersimpan di workspace Cognify."
					icon={FileText}
				/>
				<OverviewStatCard
					title="Siap Dipelajari"
					value="16"
					description="Dokumen yang sudah selesai diproses dan siap ditinjau."
					icon={BookOpen}
				/>
				<OverviewStatCard
					title="Sedang Diproses"
					value="5"
					description="Materi yang sedang melalui tahap ekstraksi dan analisis."
					icon={Clock3}
				/>
				<OverviewStatCard
					title="Progress Mingguan"
					value="+12%"
					description="Kenaikan aktivitas belajar dibanding minggu sebelumnya."
					icon={TrendingUp}
				/>
			</section>

			<section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
				<div className="space-y-4">
					<SectionHeader
						title="Dokumen Terbaru"
						description="Lanjutkan membaca atau pantau status materi yang baru ditambahkan."
					/>

					<DocumentList documents={recentDocuments} />
				</div>

				<div className="space-y-6">
					<section className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm">
						<SectionHeader
							title="Quick Actions"
							description="Akses cepat ke alur utama di Cognify."
						/>

						<div className="mt-5 space-y-3">
							<QuickActionCard
								title="Unggah Dokumen"
								description="Tambahkan materi baru untuk diproses menjadi ringkasan dan topik."
								icon={Upload}
								href="/documents"
							/>
							<QuickActionCard
								title="Buka Documents"
								description="Lihat seluruh dokumen belajar yang sudah tersimpan."
								icon={FileText}
								href="/documents"
							/>
							<QuickActionCard
								title="Review Insights"
								description="Tinjau materi yang sudah siap untuk dipelajari kembali."
								icon={Sparkles}
								href="/dashboard"
							/>
						</div>
					</section>

					<section className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm">
						<SectionHeader
							title="Aktivitas Terbaru"
							description="Ringkasan perubahan terbaru di workspace."
						/>

						<div className="mt-5 space-y-4">
							<div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
								<div className="flex items-center gap-2">
									<StatusBadge
										label="Ready"
										status="success"
									/>
								</div>
								<p className="mt-3 text-sm font-medium text-foreground">Pengantar Machine Learning</p>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">Ringkasan dan topik utama berhasil dibuat.</p>
							</div>

							<div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
								<div className="flex items-center gap-2">
									<StatusBadge
										label="Processing"
										status="warning"
									/>
								</div>
								<p className="mt-3 text-sm font-medium text-foreground">Linear Algebra for AI</p>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">Dokumen sedang dianalisis untuk menghasilkan insight belajar.</p>
							</div>

							<div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
								<div className="flex items-center gap-2">
									<StatusBadge
										label="Uploaded"
										status="info"
									/>
								</div>
								<p className="mt-3 text-sm font-medium text-foreground">Statistika Dasar</p>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">Dokumen baru saja ditambahkan ke workspace.</p>
							</div>
						</div>
					</section>

					<section className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm">
						<UploadTriggerButton
							label="Unggah materi baru"
							helperText="Tambahkan file PDF atau dokumen belajar untuk diproses di Cognify"
						/>
					</section>
				</div>
			</section>
		</div>
	);
}
