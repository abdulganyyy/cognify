"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  LayoutGrid,
  FileText,
  MessageSquare,
  Layers3,
} from "lucide-react"

import { cn } from "@/lib/utils/cn"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
    exact: true,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "Flashcards",
    href: "/flashcards",
    icon: Layers3,
  },
  {
    title: "Chat",
    href: "/chat",
    icon: MessageSquare,
  },
]

function isActivePath(
  pathname: string,
  href: string,
  exact?: boolean
): boolean {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-72 shrink-0 border-r border-border/60 bg-background lg:flex lg:flex-col">
      <div className="border-b border-border/60 px-6 py-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight text-foreground">
              Cognify
            </p>
            <p className="text-xs text-muted-foreground">
              Learning workspace
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="space-y-1">
          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Workspace
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href, item.exact)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="border-t border-border/60 px-4 py-4">
        <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">Cognify</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Workspace belajar yang tenang, rapi, dan fokus.
          </p>
        </div>
      </div>
    </aside>
  )
}