"use client";

import { useState } from "react";
import { FileText, Loader2, RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface DocumentSummaryCardProps {
  summary?: string | null;
  shortSummary?: string | null;
  title?: string;
  description?: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  className?: string;
}

export function DocumentSummaryCard({
  summary,
  shortSummary,
  title = "Ringkasan",
  description = "Intisari utama dari dokumen yang sudah diproses.",
  onRegenerate,
  isRegenerating = false,
  className,
}: DocumentSummaryCardProps) {
  const [mode, setMode] = useState<"full" | "short">("full");
  const activeText = mode === "short" && shortSummary ? shortSummary : summary;

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
          <div className="flex flex-wrap items-center gap-2">
            {shortSummary && summary && (
              <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setMode("full")}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-medium transition-colors",
                    mode === "full"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Lengkap
                </button>
                <button
                  type="button"
                  onClick={() => setMode("short")}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-medium transition-colors",
                    mode === "short"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Singkat
                </button>
              </div>
            )}

            {onRegenerate && (
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
            )}
          </div>
        }
      />

      <div className="mt-5">
        {activeText ? (
          <div className="prose prose-slate max-w-none text-sm leading-7 text-foreground">
            <p className="whitespace-pre-line text-sm leading-7 text-foreground">
              {activeText}
            </p>
          </div>
        ) : (
          <EmptyState
            className="min-h-[220px]"
            icon={<FileText className="h-5 w-5 text-blue-500" />}
            title="Ringkasan belum tersedia"
            description="Ringkasan akan muncul setelah dokumen selesai diproses."
          />
        )}
      </div>
    </section>
  );
}
