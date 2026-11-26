"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  Pencil,
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
  useUpdateFlashcardMutation,
} from "@/lib/query/hooks";
import { cn } from "@/lib/utils/cn";
import type { DocumentDetail } from "@/types/domain";

interface DocumentFlashcardsSectionProps {
  documentId: string;
  flashcards: DocumentDetail["flashcards"];
  isProcessing?: boolean;
}

type FlashcardDifficulty = "easy" | "medium" | "hard";
type DifficultyFilter = "all" | FlashcardDifficulty;

const DIFFICULTY_OPTIONS: readonly FlashcardDifficulty[] = ["easy", "medium", "hard"];

const DIFFICULTY_LABEL: Record<FlashcardDifficulty, { label: string; className: string }> = {
  easy: { label: "Mudah", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  medium: { label: "Sedang", className: "bg-amber-50 text-amber-700 border-amber-200" },
  hard: { label: "Sulit", className: "bg-red-50 text-red-700 border-red-200" },
};

const FILTER_LABELS: Record<DifficultyFilter, string> = {
  all: "Semua",
  easy: "Mudah",
  medium: "Sedang",
  hard: "Sulit",
};

function DifficultySelector({
  value,
  onChange,
}: {
  value: FlashcardDifficulty;
  onChange: (next: FlashcardDifficulty) => void;
}) {
  return (
    <div className="flex gap-2">
      {DIFFICULTY_OPTIONS.map((lvl) => (
        <Button
          key={lvl}
          type="button"
          size="sm"
          variant={value === lvl ? "default" : "outline"}
          onClick={() => onChange(lvl)}
        >
          {DIFFICULTY_LABEL[lvl].label}
        </Button>
      ))}
    </div>
  );
}

export function DocumentFlashcardsSection({
  documentId,
  flashcards,
  isProcessing = false,
}: DocumentFlashcardsSectionProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState<FlashcardDifficulty>("medium");

  const [editingCard, setEditingCard] = useState<DocumentDetail["flashcards"][number] | null>(
    null
  );
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editDifficulty, setEditDifficulty] = useState<FlashcardDifficulty>("medium");

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const createMutation = useCreateFlashcardMutation(documentId);
  const updateMutation = useUpdateFlashcardMutation(documentId);
  const regenerateMutation = useRegenerateFlashcardsMutation(documentId);
  const deleteMutation = useDeleteFlashcardMutation(documentId);
  const bookmarkMutation = useToggleBookmarkMutation();

  const filteredFlashcards =
    difficultyFilter === "all"
      ? flashcards
      : flashcards.filter((card) => card.difficulty === difficultyFilter);

  const safeIndex =
    filteredFlashcards.length > 0
      ? Math.min(currentIndex, filteredFlashcards.length - 1)
      : 0;
  const activeCard = filteredFlashcards[safeIndex];

  useEffect(() => {
    if (
      filteredFlashcards.length === 0 ||
      createOpen ||
      Boolean(editingCard) ||
      Boolean(deleteTargetId)
    ) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFlipped(false);
        setCurrentIndex((prev) =>
          prev > 0 ? prev - 1 : filteredFlashcards.length - 1
        );
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setFlipped(false);
        setCurrentIndex((prev) =>
          prev < filteredFlashcards.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === " ") {
        e.preventDefault();
        setFlipped((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredFlashcards.length, createOpen, editingCard, deleteTargetId]);

  const handleFilterChange = (nextFilter: DifficultyFilter) => {
    setDifficultyFilter(nextFilter);
    setCurrentIndex(0);
    setFlipped(false);
  };

  const handlePrev = () => {
    setFlipped(false);
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : filteredFlashcards.length - 1
    );
  };

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prev) =>
      prev < filteredFlashcards.length - 1 ? prev + 1 : 0
    );
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

  const openEditModal = (card: DocumentDetail["flashcards"][number]) => {
    setEditingCard(card);
    setEditQuestion(card.question);
    setEditAnswer(card.answer);
    setEditDifficulty(
      card.difficulty === "easy" || card.difficulty === "hard"
        ? card.difficulty
        : "medium"
    );
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard || !editQuestion.trim() || !editAnswer.trim()) return;
    await updateMutation.mutateAsync({
      flashcardId: editingCard.id,
      question: editQuestion.trim(),
      answer: editAnswer.trim(),
      difficulty: editDifficulty,
    });
    setEditingCard(null);
  };

  const difficultyCounts: Record<DifficultyFilter, number> = {
    all: flashcards.length,
    easy: flashcards.filter((c) => c.difficulty === "easy").length,
    medium: flashcards.filter((c) => c.difficulty === "medium").length,
    hard: flashcards.filter((c) => c.difficulty === "hard").length,
  };

  return (
    <section className="rounded-xl border border-neutral-100 bg-white p-5">
      <SectionHeader
        variant="label"
        icon={<CreditCard className="h-3.5 w-3.5 text-blue-500" />}
        title={`Flashcards (${flashcards.length})`}
        description="Latih ingatan aktif dengan kartu tanya jawab dari dokumenmu."
        className="mb-4"
        trailing={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => setCreateOpen(true)}
              className="h-7 gap-1.5 rounded-lg border-neutral-200 bg-white px-2.5 text-[11px] text-neutral-600 hover:bg-neutral-50"
            >
              <Plus className="h-3 w-3" />
              Tambah Kartu
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={isProcessing || regenerateMutation.isPending}
              onClick={() => regenerateMutation.mutate()}
              className="h-7 gap-1.5 rounded-lg border-neutral-200 bg-white px-2.5 text-[11px] text-neutral-600 hover:bg-neutral-50"
            >
              {regenerateMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Buat Ulang AI
            </Button>
          </div>
        }
      />

      {flashcards.length > 0 && (
        <div
          className="mb-4 flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Filter tingkat kesulitan flashcard"
        >
          {(["all", "easy", "medium", "hard"] as const).map((filterKey) => {
            const active = difficultyFilter === filterKey;
            return (
              <button
                key={filterKey}
                type="button"
                aria-pressed={active}
                onClick={() => handleFilterChange(filterKey)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                )}
              >
                <span>{FILTER_LABELS[filterKey]}</span>
                <span className={cn("text-[11px]", active ? "text-blue-500" : "text-neutral-400")}>
                  ({difficultyCounts[filterKey]})
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div>
        {flashcards.length === 0 ? (
          <EmptyState
            className="min-h-[240px]"
            icon={<CreditCard className="h-5 w-5 text-blue-500" />}
            title="Flashcard belum tersedia"
            description="Flashcard akan dibuat otomatis setelah dokumen selesai diproses, atau kamu bisa membuatnya secara manual."
          />
        ) : filteredFlashcards.length === 0 ? (
          <EmptyState
            className="min-h-[220px]"
            icon={<CreditCard className="h-5 w-5 text-blue-500" />}
            title={`Tidak ada flashcard tingkat ${FILTER_LABELS[difficultyFilter]}`}
            description="Belum ada kartu pada tingkat kesulitan ini. Pilih filter lain atau tampilkan semua kartu."
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange("all")}
              >
                Tampilkan Semua
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {/* Active Flip Card */}
            {activeCard && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Kartu {safeIndex + 1} dari {filteredFlashcards.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {activeCard.difficulty && DIFFICULTY_LABEL[activeCard.difficulty as FlashcardDifficulty] && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[11px]",
                          DIFFICULTY_LABEL[activeCard.difficulty as FlashcardDifficulty].className
                        )}
                      >
                        {DIFFICULTY_LABEL[activeCard.difficulty as FlashcardDifficulty].label}
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
                      className="h-7 w-7 text-neutral-400 hover:text-blue-600"
                      disabled={updateMutation.isPending}
                      onClick={() => openEditModal(activeCard)}
                      aria-label="Edit flashcard"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-neutral-400 hover:text-red-600"
                      disabled={deleteMutation.isPending}
                      onClick={() => setDeleteTargetId(activeCard.id)}
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

            {/* All Cards List (sembunyikan jawaban agar active recall terjaga) */}
            <div className="space-y-2.5 border-t border-neutral-100 pt-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Daftar Pertanyaan
                </p>
                <span className="text-[11px] text-neutral-400">
                  Pintasan: Spasi balik · ← / → pindah
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {filteredFlashcards.map((card, index) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(index);
                      setFlipped(false);
                    }}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-colors",
                      index === safeIndex
                        ? "border-blue-200 bg-blue-50/40"
                        : "border-neutral-100 bg-neutral-50/40 hover:border-neutral-200 hover:bg-white"
                    )}
                  >
                    <p className="line-clamp-2 text-xs font-medium text-neutral-800">
                      {index + 1}. {card.question}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialog Tambah Flashcard Manual */}
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
              <DifficultySelector value={difficulty} onChange={setDifficulty} />
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

      {/* Dialog Edit Flashcard */}
      <Dialog
        open={Boolean(editingCard)}
        onOpenChange={(open) => {
          if (!open && !updateMutation.isPending) setEditingCard(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
            <DialogDescription>
              Perbarui pertanyaan, jawaban, atau tingkat kesulitan kartu ini.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fc-edit-question">Pertanyaan</Label>
              <Textarea
                id="fc-edit-question"
                rows={3}
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
                placeholder="Tulis pertanyaan..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fc-edit-answer">Jawaban</Label>
              <Textarea
                id="fc-edit-answer"
                rows={3}
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
                placeholder="Tulis jawaban..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tingkat Kesulitan</Label>
              <DifficultySelector value={editDifficulty} onChange={setEditDifficulty} />
            </div>

            {editingCard?.sourceExcerpt && (
              <div className="space-y-1.5">
                <Label>Kutipan Sumber</Label>
                <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs italic leading-relaxed text-neutral-600">
                  &ldquo;{editingCard.sourceExcerpt}&rdquo;
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={updateMutation.isPending}
                onClick={() => setEditingCard(null)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Hapus Flashcard */}
      <Dialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTargetId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Flashcard?</DialogTitle>
            <DialogDescription>
              Kartu tanya jawab ini akan dihapus permanen dari dokumen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteTargetId(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={async () => {
                if (!deleteTargetId) return;
                await deleteMutation.mutateAsync(deleteTargetId);
                setDeleteTargetId(null);
              }}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
