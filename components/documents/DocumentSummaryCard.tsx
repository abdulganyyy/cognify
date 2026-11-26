"use client";

import { Fragment, useState } from "react";
import { Check, Copy, FileText, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
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

function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} className="font-semibold text-neutral-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={index}
          className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-800"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function FormattedSummary({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);

  return (
    <div className="space-y-3 text-sm leading-relaxed text-neutral-700">
      {blocks.map((block, blockIdx) => {
        const lines = block
          .split("\n")
          .map((l) => l.trimEnd())
          .filter((l) => l.trim().length > 0);

        if (lines.length === 0) return null;

        const isBulletList = lines.every((l) => /^[-*•]\s+/.test(l.trim()));
        if (isBulletList) {
          return (
            <ul key={blockIdx} className="list-disc space-y-1.5 pl-5">
              {lines.map((line, i) => (
                <li key={i}>{renderInlineFormatting(line.trim().replace(/^[-*•]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        const isOrderedList = lines.every((l) => /^\d+\.\s+/.test(l.trim()));
        if (isOrderedList) {
          return (
            <ol key={blockIdx} className="list-decimal space-y-1.5 pl-5">
              {lines.map((line, i) => (
                <li key={i}>{renderInlineFormatting(line.trim().replace(/^\d+\.\s+/, ""))}</li>
              ))}
            </ol>
          );
        }

        return (
          <div key={blockIdx} className="space-y-1.5">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
              if (headingMatch) {
                return (
                  <h3
                    key={lineIdx}
                    className="pt-1 text-sm font-semibold text-neutral-900"
                  >
                    {renderInlineFormatting(headingMatch[2])}
                  </h3>
                );
              }
              if (/^[-*•]\s+/.test(trimmed)) {
                return (
                  <p key={lineIdx} className="flex items-start gap-2 pl-1">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    <span>{renderInlineFormatting(trimmed.replace(/^[-*•]\s+/, ""))}</span>
                  </p>
                );
              }
              return <p key={lineIdx}>{renderInlineFormatting(trimmed)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

export function DocumentSummaryCard({
  summary,
  shortSummary,
  title = "Ringkasan AI",
  description,
  onRegenerate,
  isRegenerating = false,
  className,
}: DocumentSummaryCardProps) {
  const [mode, setMode] = useState<"full" | "short">("full");
  const [copied, setCopied] = useState(false);
  const activeText = mode === "short" && shortSummary ? shortSummary : summary;

  const handleCopy = async () => {
    if (!activeText) return;
    try {
      await navigator.clipboard.writeText(activeText);
      setCopied(true);
      toast.success("Ringkasan disalin ke clipboard.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Gagal menyalin teks.");
    }
  };

  return (
    <section
      className={cn(
        "rounded-xl border border-neutral-100 bg-white p-5",
        className
      )}
    >
      <SectionHeader
        variant="label"
        icon={<Sparkles className="h-3.5 w-3.5 text-blue-500" />}
        title={title}
        description={description}
        className="mb-3"
        trailing={
          <div className="flex flex-wrap items-center gap-1.5">
            {shortSummary && summary && (
              <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setMode("full")}
                  className={cn(
                    "rounded-md px-2 py-0.5 font-medium transition-colors",
                    mode === "full"
                      ? "bg-white text-neutral-800 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-800"
                  )}
                >
                  Lengkap
                </button>
                <button
                  type="button"
                  onClick={() => setMode("short")}
                  className={cn(
                    "rounded-md px-2 py-0.5 font-medium transition-colors",
                    mode === "short"
                      ? "bg-white text-neutral-800 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-800"
                  )}
                >
                  Singkat
                </button>
              </div>
            )}

            {activeText && (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => void handleCopy()}
                className="h-7 gap-1 rounded-lg border-neutral-200 bg-white px-2.5 text-[11px] text-neutral-600 hover:bg-neutral-50"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? "Disalin" : "Salin"}
              </Button>
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
        {activeText ? (
          <FormattedSummary text={activeText} />
        ) : (
          <EmptyState
            className="min-h-[200px]"
            icon={<FileText className="h-5 w-5 text-blue-500" />}
            title="Ringkasan belum tersedia"
            description="Ringkasan akan muncul setelah dokumen selesai diproses."
          />
        )}
      </div>
    </section>
  );
}
