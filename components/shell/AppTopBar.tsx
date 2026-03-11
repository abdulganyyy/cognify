import { Menu, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProfile } from "./AppShell";

interface AppTopbarProps {
  pageTitle?: string;
  user: UserProfile;
  /** Mobile: buka sidebar */
  onMenuClick?: () => void;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/**
 * AppTopbar
 *
 * Header ringan yang muncul di atas konten utama.
 * - Desktop: hanya menampilkan pageTitle (sidebar sudah ada di kiri)
 * - Mobile: menampilkan logo + hamburger + avatar
 *
 * @example
 * <AppTopbar
 *   pageTitle="Ringkasan Dokumen"
 *   user={user}
 *   onMenuClick={() => setMobileOpen(true)}
 * />
 */
export function AppTopbar({
  pageTitle,
  user,
  onMenuClick,
  className,
}: AppTopbarProps) {
  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center gap-3 border-b border-neutral-100 bg-white px-4",
        className
      )}
    >
      {/* ── Mobile: Hamburger + Logo ─────────────────────────── */}
      <div className="flex items-center gap-2 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-neutral-500 hover:text-neutral-800"
          onClick={onMenuClick}
          aria-label="Buka menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
            <BookOpen className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-neutral-900">
            Cognify
          </span>
        </div>
      </div>

      {/* ── Desktop: Page Title ──────────────────────────────── */}
      {pageTitle && (
        <h1 className="hidden lg:block text-sm font-semibold text-neutral-800 tracking-tight">
          {pageTitle}
        </h1>
      )}

      {/* ── Spacer ───────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Right: Mobile Avatar ─────────────────────────────── */}
      <div className="lg:hidden">
        <Avatar className="h-7 w-7">
          {user.avatarUrl && (
            <AvatarImage src={user.avatarUrl} alt={user.name} />
          )}
          <AvatarFallback className="bg-blue-100 text-blue-700 text-[10px] font-semibold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}