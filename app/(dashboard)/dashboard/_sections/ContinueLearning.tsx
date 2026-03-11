import { BookOpen, ChevronRight, CreditCard, Layers } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import type { LearningSession } from "../types";

// ─── Section label map ────────────────────────────────────────────────────────

const sectionLabel: Record<LearningSession["lastSection"], string> = {
  summary: "Summary",
  topics: "Topics",
  flashcards: "Flashcards",
  chat: "AI Chat",
};

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-neutral-100">
      <div
        className="h-1.5 rounded-full bg-blue-500 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

// ─── Session Card ─────────────────────────────────────────────────────────────

interface SessionCardProps {
  session: LearningSession;
  onContinue?: (documentId: string) => void;
}

function SessionCard({ session, onContinue }: SessionCardProps) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
          <BookOpen className="h-4 w-4 text-blue-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-neutral-800 leading-snug">
            {session.title}
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">
            Last studied {session.lastAccessedAt} · {sectionLabel[session.lastSection]}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <Layers className="h-3 w-3 text-neutral-400" />
          {session.topicCount} topics
        </div>
        <div className="h-3 w-px bg-neutral-200" />
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <CreditCard className="h-3 w-3 text-neutral-400" />
          {session.flashcardCount} cards
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-neutral-500">Progress</span>
          <span className={cn(
            "text-[11px] font-semibold",
            session.progressPercent >= 70 ? "text-emerald-600" : "text-blue-500"
          )}>
            {session.progressPercent}%
          </span>
        </div>
        <ProgressBar percent={session.progressPercent} />
      </div>

      {/* CTA */}
      <Button
        size="sm"
        onClick={() => onContinue?.(session.documentId)}
        className="h-8 gap-1.5 w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 shadow-none text-xs font-medium"
        variant="ghost"
      >
        Continue learning
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface ContinueLearningProps {
  sessions: LearningSession[];
  onContinue?: (documentId: string) => void;
}

/**
 * ContinueLearning
 *
 * Dokumen yang sedang dipelajari user dengan progress dan CTA.
 *
 * @example
 * <ContinueLearning
 *   sessions={activeSessions}
 *   onContinue={(id) => router.push(`/documents/${id}`)}
 * />
 */
export function ContinueLearning({ sessions, onContinue }: ContinueLearningProps) {
  if (sessions.length === 0) return null;

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-neutral-800">Continue Learning</h2>
        <p className="mt-0.5 text-xs text-neutral-400">Pick up where you left off</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sessions.map((session) => (
          <SessionCard
            key={session.documentId}
            session={session}
            onContinue={onContinue}
          />
        ))}
      </div>
    </section>
  );
}