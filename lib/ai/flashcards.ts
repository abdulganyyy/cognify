import { z } from "zod";
import { generateJsonCompletion } from "@/lib/ai/client";
import { FLASHCARDS_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { truncateText } from "@/lib/utils/text";

const flashcardsResponseSchema = z.object({
  flashcards: z
    .array(
      z.object({
        question: z.string().min(5).max(1000),
        answer: z.string().min(2).max(2000),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
        sourceExcerpt: z.string().max(500).optional(),
        sectionNumber: z.number().int().positive().optional(),
      })
    )
    .min(1)
    .max(20),
});

export interface GeneratedFlashcard {
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  sourceExcerpt: string | null;
  sectionNumber?: number;
  cardOrder: number;
}

export async function generateDocumentFlashcards(params: {
  title: string;
  sections: Array<{ sectionIndex: number; title: string | null; content: string }>;
}): Promise<GeneratedFlashcard[]> {
  const formattedSections = params.sections
    .map(
      (section) =>
        `[Bagian ${section.sectionIndex}${section.title ? ` — ${section.title}` : ""}]\n${truncateText(section.content, 1600)}`
    )
    .join("\n\n");

  const raw = await generateJsonCompletion<unknown>({
    systemPrompt: FLASHCARDS_SYSTEM_PROMPT,
    userPrompt: `Judul Dokumen: ${params.title}\n\nBagian Dokumen:\n${truncateText(formattedSections, 26000)}`,
    temperature: 0.4,
    maxTokens: 2500,
  });

  const parsed = flashcardsResponseSchema.parse(raw);

  return parsed.flashcards.map((card, index) => ({
    question: card.question.trim(),
    answer: card.answer.trim(),
    difficulty: card.difficulty ?? "medium",
    sourceExcerpt: card.sourceExcerpt?.trim() || null,
    sectionNumber: card.sectionNumber,
    cardOrder: index + 1,
  }));
}
