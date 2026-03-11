import { Upload, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadCtaCardProps {
  onUploadClick?: () => void;
}

/**
 * UploadCtaCard
 *
 * Card CTA utama untuk upload PDF baru.
 * Tampil di bagian atas dashboard sebagai prompt yang breathable.
 *
 * @example
 * <UploadCtaCard onUploadClick={() => setUploadOpen(true)} />
 */
export function UploadCtaCard({ onUploadClick }: UploadCtaCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-blue-100 px-6 py-5"
      style={{
        background: "linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)",
      }}
    >
      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, #93c5fd 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-blue-50/60" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Text side */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200">
            <Upload className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800">
              Upload a new PDF
            </p>
            <p className="mt-0.5 text-xs text-neutral-500 leading-relaxed max-w-sm">
              Drop any document and Cognify will generate summaries, topics, and flashcards automatically.
            </p>
          </div>
        </div>

        {/* What you get pills */}
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-wrap gap-1.5">
            {[
              { icon: Sparkles, label: "AI Summary" },
              { icon: FileText, label: "Topics" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white/80 px-2.5 py-0.5 text-[11px] font-medium text-blue-600"
              >
                <Icon className="h-3 w-3" />
                {label}
              </span>
            ))}
          </div>
          <Button
            onClick={onUploadClick}
            size="sm"
            className="h-8 gap-1.5 bg-blue-600 px-4 text-xs font-medium text-white hover:bg-blue-700 shadow-sm shadow-blue-100"
          >
            <Upload className="h-3.5 w-3.5" />
            Choose file
          </Button>
        </div>
      </div>
    </div>
  );
}