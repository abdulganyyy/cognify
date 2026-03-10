import { FileText } from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { cn } from "@/lib/utils/cn"

export interface DocumentSummaryCardProps {
  summary?: string
  title?: string
  description?: string
  className?: string
}

export function DocumentSummaryCard({
  summary,
  title = "Ringkasan",
  description = "Intisari utama dari dokumen yang sudah diproses.",
  className,
}: DocumentSummaryCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/60 bg-background p-5 shadow-sm sm:p-6",
        className
      )}
    >
      <SectionHeader title={title} description={description} />

      <div className="mt-5">
        {summary ? (
          <div className="prose prose-slate max-w-none text-sm leading-7 text-foreground">
            <p className="whitespace-pre-line text-sm leading-7 text-foreground">
              {summary}
            </p>
          </div>
        ) : (
          <EmptyState
            className="min-h-[220px]"
            icon={<FileText className="h-5 w-5" />}
            title="Ringkasan belum tersedia"
            description="Ringkasan akan muncul setelah dokumen selesai diproses."
          />
        )}
      </div>
    </section>
  )
}