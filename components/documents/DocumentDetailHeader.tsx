import Link from "next/link"
import { ChevronLeft, FileText } from "lucide-react"

import { BookmarkButton } from "@/components/shared/BookmarkButton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

export type DocumentDetailStatus =
  | "draft"
  | "uploaded"
  | "processing"
  | "ready"
  | "failed"

export interface DocumentDetailHeaderProps {
  title: string
  description?: string
  status: DocumentDetailStatus
  updatedAt?: string
  pageCount?: number
  bookmarked?: boolean
  onBookmarkToggle?: () => void
  backHref?: string
  backLabel?: string
  actions?: React.ReactNode
  className?: string
}

function getStatusMeta(status: DocumentDetailStatus): {
  label: string
  variant: "default" | "success" | "warning" | "danger" | "info"
} {
  switch (status) {
    case "draft":
      return { label: "Draft", variant: "default" }
    case "uploaded":
      return { label: "Uploaded", variant: "info" }
    case "processing":
      return { label: "Processing", variant: "warning" }
    case "ready":
      return { label: "Ready", variant: "success" }
    case "failed":
      return { label: "Failed", variant: "danger" }
    default:
      return { label: "Unknown", variant: "default" }
  }
}

export function DocumentDetailHeader({
  title,
  description,
  status,
  updatedAt,
  pageCount,
  bookmarked = false,
  onBookmarkToggle,
  backHref = "/documents",
  backLabel = "Kembali ke Documents",
  actions,
  className,
}: DocumentDetailHeaderProps) {
  const statusMeta = getStatusMeta(status)

  return (
    <div
      className={cn(
        "space-y-5 rounded-2xl border border-border/60 bg-background p-5 shadow-sm sm:p-6",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" className="h-9 rounded-xl px-3">
          <Link href={backHref}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-muted-foreground">
            <FileText className="h-5 w-5" />
          </div>

          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge label={statusMeta.label} status={statusMeta.variant} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>

              {description ? (
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                  {description}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {updatedAt ? <span>Updated {updatedAt}</span> : null}
              {typeof pageCount === "number" ? <span>{pageCount} pages</span> : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <BookmarkButton
            size="md"
            bookmarked={bookmarked}
            onClick={onBookmarkToggle}
          />
          {actions}
        </div>
      </div>
    </div>
  )
}