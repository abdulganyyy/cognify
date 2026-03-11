/**
 * CONTOH PENGGUNAAN AppShell
 * File: app/(dashboard)/layout.tsx  ← taruh di sini untuk persistent shell
 *
 * Jika kamu pakai server-side data fetching, ganti dummy data di bawah
 * dengan fetch() ke API kamu. AppShell sendiri adalah Client Component
 * karena perlu state mobile sidebar.
 */

"use client";

import { useRouter, useParams } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import type { DocumentItem, UserProfile } from "@/components/shell/AppShell";

import { DM_Serif_Display, DM_Sans } from "next/font/google";
const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const sans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });
// ─── Dummy data (ganti dengan data dari API/props) ─────────────────────────

const DUMMY_USER: UserProfile = {
	name: "Budi Santoso",
	email: "budi@student.ac.id",
};

const DUMMY_DOCUMENTS: DocumentItem[] = [
	{
		id: "doc-1",
		title: "Kalkulus Diferensial & Integral",
		status: "ready",
		updatedAt: "2 jam lalu",
		topicCount: 12,
	},
	{
		id: "doc-2",
		title: "Pengantar Machine Learning",
		status: "processing",
		updatedAt: "Baru saja",
	},
	{
		id: "doc-3",
		title: "Struktur Data & Algoritma",
		status: "ready",
		updatedAt: "Kemarin",
		topicCount: 8,
	},
	{
		id: "doc-4",
		title: "Rekayasa Perangkat Lunak",
		status: "failed",
		updatedAt: "3 hari lalu",
	},
	{
		id: "doc-5",
		title: "Basis Data Relasional",
		status: "ready",
		updatedAt: "1 minggu lalu",
		topicCount: 6,
	},
];

// ─── Layout ────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const params = useParams();
	const activeDocId = params?.docId as string | undefined;

	const handleDocumentSelect = (id: string) => {
		router.push(`/documents/${id}`);
	};

	const handleUploadClick = () => {
		// Buka upload modal — hubungkan ke state/dialog upload kamu
		console.log("Upload triggered");
	};

	const handleSignOut = async () => {
		// Panggil sign out logic (Supabase / NextAuth / dsb.)
		console.log("Sign out");
	};

	return (
		<AppShell
			user={DUMMY_USER}
			documents={DUMMY_DOCUMENTS}
			activeDocumentId={activeDocId}
			onDocumentSelect={handleDocumentSelect}
			onUploadClick={handleUploadClick}
			onSignOut={handleSignOut}
		>
			{children}
		</AppShell>
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTOH PAGE: app/(dashboard)/dashboard/page.tsx
// ─────────────────────────────────────────────────────────────────────────────

/**
 * import { FileText } from "lucide-react";
 * import { EmptyState } from "@/components/ui/EmptyState";
 *
 * export default function DashboardPage() {
 *   return (
 *     <div className="p-6">
 *       <div className="mb-6">
 *         <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
 *         <p className="mt-1 text-sm text-neutral-500">
 *           Selamat datang di Cognify. Mulai belajar dari dokumenmu.
 *         </p>
 *       </div>
 *
 *       <EmptyState
 *         icon={<FileText className="w-7 h-7 text-blue-400" />}
 *         title="Belum ada dokumen aktif"
 *         description="Upload PDF pertamamu dan biarkan AI mengolahnya menjadi materi belajar."
 *         action={<Button size="sm">Upload PDF</Button>}
 *       />
 *     </div>
 *   );
 * }
 */
