"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  Plus,
  RefreshCw,
  RotateCw,
  Trash2,
} from "lucide-react";
import { BookmarkButton } from "@/components/shared/BookmarkButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateFlashcardMutation,
  useDeleteFlashcardMutation,
  useRegenerateFlashcardsMutation,
  useToggleBookmarkMutation,
} from "@/lib/query/hooks";
import { cn } from "@/lib/utils/cn";
import type { DocumentDetail } from "@/types/domain";

interface DocumentFlashcardsSectionProps {
  documentId: string;
  flashcards: DocumentDetail["flashcards"];
  isProcessing?: boolean;
}

const DIFFICULTY_LABEL: Record<string, { label: string; className: string }> = {
  easy: { label: "Mudah", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  medium: { label: "Sedang", className: "bg-amber-50 text-amber-700 border-amber-200" },
  hard: { label: "Sulit", className: "bg-red-50 text-red-700 border-red-200" },
};

export function DocumentFlashcardsSection({
  documentId,
  flashcards,
  isProcessing = false,
}: DocumentFlashcardsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const createMutation = useCreateFlashcardMutation(documentId);
  const regenerateMutation = useRegenerateFlashcardsMutation(documentId);
  const deleteMutation = useDeleteFlashcardMutation(documentId);
  const bookmarkMutation = useToggleBookmarkMutation();

  const safeIndex = flashcards.length > 0 ? Math.min(currentIndex, flashcards.length - 1) : 0;
  const activeCard = flashcards[safeIndex];

  const handlePrev = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
  };

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    await createMutation.mutateAsync({
      question: question.trim(),
      answer: answer.trim(),
      difficulty,
    });
    setQuestion("");
    setAnswer("");
    setDifficulty("medium");
    setCreateOpen(false);
  };

  return (
    <section className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm sm:p-6">
      <SectionHeader
        title={`Flashcards (${flashcards.length})`}
        description="Latih ingatan aktif dengan kartu tanya jawab dari dokumenmu."
        trailing={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Kartu
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isProcessing || regenerateMutation.isPending}
              onClick={() => regenerateMutation.mutate()}
              className="gap-1.5"
            >
              {regenerateMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Buat Ulang AI
            </Button>
          </div>
        }
      />

      <div className="mt-5">
        {flashcards.length === 0 ? (
          <EmptyState
            className="min-h-[240px]"
            icon={<CreditCard className="h-5 w-5 text-blue-500" />}
            title="Flashcard belum tersedia"
            description="Flashcard akan dibuat otomatis setelah dokumen selesai diproses, atau kamu bisa membuatnya secara manual."
          />
        ) : (
          <div className="space-y-6">
            {/* Active Flip Card */}
            {activeCard && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Kartu {safeIndex + 1} dari {flashcards.length}
                  </span>
                  <div className="flex items-center gap-2">
                    {activeCard.difficulty && DIFFICULTY_LABEL[activeCard.difficulty] && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[11px]",
                          DIFFICULTY_LABEL[activeCard.difficulty].className
                        )}
                      >
                        {DIFFICULTY_LABEL[activeCard.difficulty].label}
                      </Badge>
                    )}
                    <BookmarkButton
                      size="sm"
                      isBookmarked={activeCard.isBookmarked}
                      onToggle={async () => {
                        await bookmarkMutation.mutateAsync({
                          documentId,
                          bookmarkType: "flashcard",
                          flashcardId: activeCard.id,
                        });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-neutral-400 hover:text-red-600"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(activeCard.id)}
                      aria-label="Hapus flashcard"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFlipped((prev) => !prev)}
                  className={cn(
                    "flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border p-6 text-center transition-all",
                    flipped
                      ? "border-blue-200 bg-blue-50/50"
                      : "border-border bg-muted/20 hover:border-blue-200 hover:bg-muted/30"
                  )}
                >
                  <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-neutral-500 ring-1 ring-neutral-200">
                    <RotateCw className="h-3 w-3" />
                    {flipped ? "Jawaban (klik untuk balik)" : "Pertanyaan (klik untuk lihat jawaban)"}
                  </span>

                  <p className="max-w-xl text-base font-medium leading-relaxed text-foreground whitespace-pre-line">
                    {flipped ? activeCard.answer : activeCard.question}
                  </p>

                  {flipped && activeCard.sourceExcerpt && (
                    <p className="mt-4 max-w-lg rounded-xl bg-white/80 px-3.5 py-2 text-xs italic text-muted-foreground ring-1 ring-neutral-200/70">
                      Sumber: &ldquo;{activeCard.sourceExcerpt}&rdquo;
                    </p>
                  )}
                </button>

                <div className="flex items-center justify-between">
                  <Button type="button" variant="outline" size="sm" onClick={handlePrev}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Sebelumnya
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFlipped((prev) => !prev)}
                  >
                    Balik Kartu
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleNext}>
                    Berikutnya
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* All Cards List */}
            <div className="space-y-2 border-t border-border/60 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Semua Kartu
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {flashcards.map((card, index) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(index);
                      setFlipped(false);
                    }}
                    className={cn(
                      "rounded-xl border p-3.5 text-left transition-colors",
                      index === safeIndex
                        ? "border-blue-300 bg-blue-50/40"
                        : "border-border/60 bg-background hover:bg-muted/20"
                    )}
                  >
                    <p className="line-clamp-2 text-xs font-medium text-foreground">
                      {index + 1}. {card.question}
                    </p>
                    <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                      {card.answer}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Flashcard Manual</DialogTitle>
            <DialogDescription>
              Buat kartu tanya jawab tambahan untuk dokumen ini.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fc-question">Pertanyaan</Label>
              <Textarea
                id="fc-question"
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Tulis pertanyaan..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fc-answer">Jawaban</Label>
              <Textarea
                id="fc-answer"
                rows={3}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Tulis jawaban..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tingkat Kesulitan</Label>
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as const).map((lvl) => (
                  <Button
                    key={lvl}
                    type="button"
                    size="sm"
                    variant={difficulty === lvl ? "default" : "outline"}
                    onClick={() => setDifficulty(lvl)}
                  >
                    {DIFFICULTY_LABEL[lvl].label}
                  </Button>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {createMutation.isPending ? "Menyimpan..." : "Simpan Kartu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
