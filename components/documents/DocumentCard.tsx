import Link from "next/link"
import { FileText, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BookmarkButton } from "@/components/shared/BookmarkButton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { TopicTag } from "@/components/shared/TopicTag"
import { cn } from "@/lib/utils/cn"

export type DocumentCardStatus =
  | "draft"
  | "uploaded"
  | "processing"
  | "ready"
  | "failed"

export interface DocumentCardTopic {
  id: string
  label: string
}

export interface DocumentCardProps {
  id: string
  title: string
  description?: string
  updatedAt?: string
  pageCount?: number
  status: DocumentCardStatus
  topics?: DocumentCardTopic[]
  bookmarked?: boolean
  href?: string
  className?: string
  onBookmarkToggle?: () => void
  actionSlot?: React.ReactNode
}

function getStatusBadge(status: DocumentCardStatus): {
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

export function DocumentCard({
  id,
  title,
  description,
  updatedAt,
  pageCount,
  status,
  topics = [],
  bookmarked = false,
  href,
  className,
  onBookmarkToggle,
  actionSlot,
}: DocumentCardProps) {
  const statusBadge = getStatusBadge(status)
  const documentHref = href ?? `/documents/${id}`

  return (
    <article
      className={cn(
        "group rounded-2xl border border-border/60 bg-background p-5 shadow-sm transition-all hover:border-border hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-muted-foreground">
            <FileText className="h-5 w-5" />
          </div>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge label={statusBadge.label} status={statusBadge.variant} />
            </div>

            <div className="space-y-1">
              <Link
                href={documentHref}
                className="line-clamp-1 text-base font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
              >
                {title}
              </Link>

              {description ? (
                <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <BookmarkButton
            bookmarked={bookmarked}
            onClick={onBookmarkToggle}
            aria-label={bookmarked ? "Hapus bookmark dokumen" : "Simpan dokumen"}
          />

          {actionSlot ?? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Aksi dokumen"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {updatedAt ? <span>Updated {updatedAt}</span> : null}
          {typeof pageCount === "number" ? <span>{pageCount} pages</span> : null}
        </div>

        {topics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {topics.slice(0, 3).map((topic) => (
              <TopicTag key={topic.id} label={topic.label} />
            ))}

            {topics.length > 3 ? (
              <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground">
                +{topics.length - 3} more
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="pt-1">
          <Link
            href={documentHref}
            className="inline-flex items-center text-sm font-medium text-primary transition-opacity hover:opacity-80"
          >
            Lihat detail
          </Link>
        </div>
      </div>
    </article>
  )
}