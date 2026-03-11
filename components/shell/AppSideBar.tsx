"use client";

import { BookOpen, Upload, Bookmark, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarDocumentItem } from "@/components/shell/SidebarDocumentItem";
import { SidebarUserArea } from "@/components/shell/SidebarUserArea";
import type { DocumentItem, UserProfile } from "./AppShell";

// ─── Nav links (statis, sesuaikan dengan route project kamu) ──

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
];

interface AppSidebarProps {
  documents: DocumentItem[];
  activeDocumentId?: string;
  user: UserProfile;
  onDocumentSelect?: (id: string) => void;
  onUploadClick?: () => void;
  onSignOut?: () => void;
}

/**
 * AppSidebar
 *
 * Sidebar desktop Cognify.
 * Struktur: logo → nav → divider → daftar dokumen (scroll) → divider → user area
 */
export function AppSidebar({
  documents,
  activeDocumentId,
  user,
  onDocumentSelect,
  onUploadClick,
  onSignOut,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex h-full w-[240px] flex-col",
        "border-r border-neutral-100 bg-white"
      )}
    >
      {/* ── Logo ──────────────────────────────────────────────── */}
      <div className="flex h-14 items-center gap-2.5 px-5 border-b border-neutral-100">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
          <BookOpen className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-neutral-900">
          Cognify
        </span>
      </div>

      {/* ── Upload Button ──────────────────────────────────────── */}
      <div className="px-3 pt-4 pb-2">
        <Button
          onClick={onUploadClick}
          size="sm"
          className={cn(
            "w-full gap-2 justify-start font-medium text-xs h-8",
            "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-100"
          )}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload PDF
        </Button>
      </div>

      {/* ── Nav Links ──────────────────────────────────────────── */}
      <nav className="px-3 pb-1">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5",
                  isActive ? "text-blue-600" : "text-neutral-400"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <Separator className="mx-3 my-2 w-auto" />

      {/* ── Document List ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
          Dokumen
        </span>
        <span className="text-[10px] text-neutral-400">{documents.length}</span>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-0.5 pb-2">
          {documents.length === 0 ? (
            <p className="px-2 py-3 text-xs text-neutral-400 text-center leading-relaxed">
              Belum ada dokumen.
              <br />
              Upload PDF pertamamu.
            </p>
          ) : (
            documents.map((doc) => (
              <SidebarDocumentItem
                key={doc.id}
                document={doc}
                isActive={doc.id === activeDocumentId}
                onClick={() => onDocumentSelect?.(doc.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <Separator className="mx-3 mb-0 w-auto" />

      {/* ── User Area ──────────────────────────────────────────── */}
      <SidebarUserArea user={user} onSignOut={onSignOut} />
    </div>
  );
}