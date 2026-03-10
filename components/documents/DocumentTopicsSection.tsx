import { Brain } from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { SectionHeader } from "@/components/shared/SectionHeader"
import { TopicTag } from "@/components/shared/TopicTag"
import { cn } from "@/lib/utils/cn"

export interface DocumentTopicItem {
  id: string
  label: string
  description?: string
}

export interface DocumentTopicsSectionProps {
  topics?: DocumentTopicItem[]
  title?: string
  description?: string
  className?: string
}

export function DocumentTopicsSection({
  topics = [],
  title = "Topik Utama",
  description = "Pokok bahasan penting yang teridentifikasi dari dokumen.",
  className,
}: DocumentTopicsSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/60 bg-background p-5 shadow-sm sm:p-6",
        className
      )}
    >
      <SectionHeader title={title} description={description} />

      <div className="mt-5">
        {topics.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <TopicTag key={topic.id} label={topic.label} />
              ))}
            </div>

            <div className="grid gap-3">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <p className="text-sm font-medium text-foreground">
                    {topic.label}
                  </p>
                  {topic.description ? (
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {topic.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            className="min-h-[220px]"
            icon={<Brain className="h-5 w-5" />}
            title="Topik belum tersedia"
            description="Topik utama akan tampil setelah dokumen selesai dianalisis."
          />
        )}
      </div>
    </section>
  )
}