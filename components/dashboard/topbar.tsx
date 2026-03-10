"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Menu, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

function getPageMeta(pathname: string) {
  if (pathname === "/dashboard") {
    return {
      title: "Dashboard",
      description: "Ringkasan aktivitas belajar dan progres terbaru.",
    }
  }

  if (pathname === "/documents") {
    return {
      title: "Documents",
      description: "Kelola dokumen belajar, ringkasan, dan topik penting.",
    }
  }

  if (pathname.startsWith("/documents/")) {
    return {
      title: "Document Detail",
      description: "Tinjau isi dokumen, topik, ringkasan, dan hasil proses.",
    }
  }

  if (pathname === "/flashcards") {
    return {
      title: "Flashcards",
      description: "Latih pemahaman dengan kartu belajar yang terstruktur.",
    }
  }

  if (pathname === "/chat") {
    return {
      title: "Chat",
      description: "Tanya jawab dengan konteks materi yang sedang dipelajari.",
    }
  }

  return {
    title: "Cognify",
    description: "Workspace belajar modern.",
  }
}

export function Topbar() {
  const pathname = usePathname()
  const pageMeta = getPageMeta(pathname)

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {pageMeta.title}
            </p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {pageMeta.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground md:flex">
            <Search className="h-4 w-4" />
            <span>Cari materi...</span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-xl border border-transparent text-muted-foreground",
              "hover:border-border hover:bg-accent hover:text-foreground"
            )}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>

          <Link
            href="/documents"
            className="hidden rounded-xl border border-border/60 bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent md:inline-flex"
          >
            Documents
          </Link>
        </div>
      </div>
    </header>
  )
}