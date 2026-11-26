"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppShell } from "@/components/shell/AppShell";
import type { DocumentItem, UserProfile } from "@/components/shell/AppShell";
import {
  UploadModalProvider,
  useUploadModal,
} from "@/components/documents/UploadDocumentDialog";
import { useDashboardQuery } from "@/lib/query/hooks";
import { formatRelativeTime } from "@/lib/utils/dates";

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/documents/")) return "Ruang Belajar Dokumen";
  if (pathname.startsWith("/documents")) return "Dokumen Saya";
  if (pathname.startsWith("/bookmarks")) return "Bookmark";
  return "Beranda";
}

function DashboardShellContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { openUploadModal } = useUploadModal();
  const dashboardQuery = useDashboardQuery();

  const activeDocId =
    typeof params?.documentId === "string" ? params.documentId : undefined;

  const user: UserProfile = dashboardQuery.data?.user
    ? {
        name: dashboardQuery.data.user.name,
        email: dashboardQuery.data.user.email,
        avatarUrl: dashboardQuery.data.user.avatarUrl ?? undefined,
      }
    : {
        name: "Pengguna",
        email: "",
      };

  const documents: DocumentItem[] = (dashboardQuery.data?.documents ?? []).map((doc) => ({
    id: doc.id,
    title: doc.title,
    status: doc.status,
    updatedAt: formatRelativeTime(doc.updatedAt),
    topicCount: doc.topicCount,
  }));

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Gagal keluar dari akun.");
    }
  };

  return (
    <AppShell
      user={user}
      documents={documents}
      activeDocumentId={activeDocId}
      pageTitle={getPageTitle(pathname)}
      onDocumentSelect={(id) => router.push(`/documents/${id}`)}
      onUploadClick={openUploadModal}
      onSignOut={handleSignOut}
    >
      {children}
    </AppShell>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UploadModalProvider>
      <DashboardShellContent>{children}</DashboardShellContent>
    </UploadModalProvider>
  );
}
