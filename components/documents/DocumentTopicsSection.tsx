"use client";

import { Brain, Loader2, RefreshCw } from "lucide-react";
import { BookmarkButton } from "@/components/shared/BookmarkButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { TopicTag } from "@/components/shared/TopicTag";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface DocumentTopicItem {
  id: string;
  label: string;
  description?: string | null;
  isBookmarked?: boolean;
}

export interface DocumentTopicsSectionProps {
  topics?: DocumentTopicItem[];
  title?: string;
  description?: string;
  onToggleBookmark?: (topicId: string) => void | Promise<void>;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  className?: string;
}

export function DocumentTopicsSection({
  topics = [],
  title = "Topik Utama",
  description = "Pokok bahasan penting yang teridentifikasi dari dokumen.",
  onToggleBookmark,
  onRegenerate,
  isRegenerating = false,
  className,
}: DocumentTopicsSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/60 bg-background p-5 shadow-sm sm:p-6",
        className
      )}
    >
      <SectionHeader
        title={title}
        description={description}
        trailing={
          onRegenerate ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isRegenerating}
              onClick={onRegenerate}
              className="gap-1.5"
            >
              {isRegenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Buat Ulang
            </Button>
          ) : undefined
        }
      />

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
                  className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {topic.label}
                    </p>
                    {topic.description ? (
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {topic.description}
                      </p>
                    ) : null}
                  </div>

                  {onToggleBookmark && (
                    <BookmarkButton
                      size="sm"
                      isBookmarked={Boolean(topic.isBookmarked)}
                      onToggle={() => onToggleBookmark(topic.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            className="min-h-[220px]"
            icon={<Brain className="h-5 w-5 text-blue-500" />}
            title="Topik belum tersedia"
            description="Topik utama akan tampil setelah dokumen selesai dianalisis."
          />
        )}
      </div>
    </section>
  );
}
