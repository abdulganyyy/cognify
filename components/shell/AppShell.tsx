"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/shell/AppSideBar";
import { AppTopbar } from "@/components/shell/AppTopBar";
import { MobileSidebar } from "@/components/shell/MobileSideBar";
import { cn } from "@/lib/utils/cn";

export interface DocumentItem {
  id: string;
  title: string;
  status: "ready" | "processing" | "failed" | "uploading";
  updatedAt: string;
  topicCount?: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AppShellProps {
  children: React.ReactNode;
  documents?: DocumentItem[];
  activeDocumentId?: string;
  user: UserProfile;
  onDocumentSelect?: (id: string) => void;
  onUploadClick?: () => void;
  onSignOut?: () => void;
  /** Current page title shown in topbar */
  pageTitle?: string;
}

/**
 * AppShell
 *
 * Root layout untuk semua halaman authenticated Cognify.
 * Menyatukan sidebar, topbar, dan area konten utama.
 *
 * @example
 * // app/(dashboard)/layout.tsx
 * export default function DashboardLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <AppShell
 *       user={{ name: "Budi Santoso", email: "budi@email.com" }}
 *       documents={documents}
 *       activeDocumentId={params.docId}
 *       onUploadClick={() => setUploadOpen(true)}
 *     >
 *       {children}
 *     </AppShell>
 *   );
 * }
 */
export function AppShell({
  children,
  documents = [],
  activeDocumentId,
  user,
  onDocumentSelect,
  onUploadClick,
  onSignOut,
  pageTitle,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-50">
      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <AppSidebar
          documents={documents}
          activeDocumentId={activeDocumentId}
          user={user}
          onDocumentSelect={onDocumentSelect}
          onUploadClick={onUploadClick}
          onSignOut={onSignOut}
        />
      </aside>

      {/* ── Mobile Sidebar ──────────────────────────────────────── */}
      <MobileSidebar
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        documents={documents}
        activeDocumentId={activeDocumentId}
        user={user}
        onDocumentSelect={(id) => {
          onDocumentSelect?.(id);
          setMobileOpen(false);
        }}
        onUploadClick={() => {
          onUploadClick?.();
          setMobileOpen(false);
        }}
        onSignOut={onSignOut}
      />

      {/* ── Main Area ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          pageTitle={pageTitle}
          user={user}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main
          className={cn(
            "flex-1 overflow-y-auto",
            "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-200"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}