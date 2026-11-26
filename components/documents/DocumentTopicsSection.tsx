"use client";

import { Layers, Loader2, MessageSquare, RefreshCw } from "lucide-react";
import { BookmarkButton } from "@/components/shared/BookmarkButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface DocumentTopicItem {
  id: string;
  label: string;
  description?: string | null;
  importanceScore?: number | null;
  isBookmarked?: boolean;
}

function getImportanceMeta(score: number): { label: string; className: string } {
  const normalized = score <= 1 ? score * 100 : score;
  const percent = Math.round(Math.max(0, Math.min(100, normalized)));

  if (percent >= 80) {
    return {
      label: `Prioritas Tinggi · ${percent}%`,
      className: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }
  if (percent >= 50) {
    return {
      label: `Sedang · ${percent}%`,
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }
  return {
    label: `Dasar · ${percent}%`,
    className: "border-neutral-200 bg-neutral-100 text-neutral-600",
  };
}

export interface DocumentTopicsSectionProps {
  topics?: DocumentTopicItem[];
  title?: string;
  description?: string;
  onToggleBookmark?: (topicId: string) => void | Promise<void>;
  onAskTopic?: (topicLabel: string) => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  className?: string;
}

export function DocumentTopicsSection({
  topics = [],
  title = "Topik Utama",
  description,
  onToggleBookmark,
  onAskTopic,
  onRegenerate,
  isRegenerating = false,
  className,
}: DocumentTopicsSectionProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-neutral-100 bg-white p-5",
        className
      )}
    >
      <SectionHeader
        variant="label"
        icon={<Layers className="h-3.5 w-3.5 text-blue-500" />}
        title={title}
        description={description}
        className="mb-3"
        trailing={
          <div className="flex items-center gap-2">
            {topics.length > 0 && (
              <span className="text-[11px] text-neutral-400">
                {topics.length} topik
              </span>
            )}
            {onRegenerate && (
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={isRegenerating}
                onClick={onRegenerate}
                className="h-7 gap-1.5 rounded-lg border-neutral-200 bg-white px-2.5 text-[11px] text-neutral-600 hover:bg-neutral-50"
              >
                {isRegenerating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Buat Ulang
              </Button>
            )}
          </div>
        }
      />

      <div>
        {topics.length > 0 ? (
          <div className="grid gap-2.5">
            {topics.map((topic, index) => {
              const importance =
                typeof topic.importanceScore === "number" && Number.isFinite(topic.importanceScore)
                  ? getImportanceMeta(topic.importanceScore)
                  : null;

              return (
                <div
                  key={topic.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-neutral-100 bg-neutral-50/50 p-3.5 transition-colors hover:border-neutral-200 hover:bg-white"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-50 text-[10px] font-semibold text-blue-600">
                        {index + 1}
                      </span>
                      <p className="text-sm font-medium text-neutral-800">
                        {topic.label}
                      </p>
                      {importance && (
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-medium", importance.className)}
                        >
                          {importance.label}
                        </Badge>
                      )}
                    </div>
                    {topic.description ? (
                      <p className="mt-1.5 pl-7 text-xs leading-relaxed text-neutral-500">
                        {topic.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {onAskTopic && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => onAskTopic(topic.label)}
                        className="h-7 gap-1 rounded-lg px-2 text-[11px] font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Tanya AI
                      </Button>
                    )}
                    {onToggleBookmark && (
                      <BookmarkButton
                        size="sm"
                        isBookmarked={Boolean(topic.isBookmarked)}
                        onToggle={() => onToggleBookmark(topic.id)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            className="min-h-[200px]"
            icon={<Layers className="h-5 w-5 text-blue-500" />}
            title="Topik belum tersedia"
            description="Topik utama akan tampil setelah dokumen selesai dianalisis."
          />
        )}
      </div>
    </section>
  );
}
