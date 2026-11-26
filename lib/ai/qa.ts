import { z } from "zod";
import { generateJsonCompletion } from "@/lib/ai/client";
import { QA_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { truncateText } from "@/lib/utils/text";

const qaResponseSchema = z.object({
  answer: z.string().min(1),
  usedSectionNumbers: z.array(z.number().int().positive()).optional(),
});

export interface SectionCandidate {
  id: string;
  sectionIndex: number;
  title: string | null;
  content: string;
}

const STOP_WORDS = new Set([
  "apa",
  "itu",
  "yang",
  "dan",
  "atau",
  "dari",
  "untuk",
  "pada",
  "dengan",
  "dalam",
  "adalah",
  "the",
  "and",
  "for",
  "with",
  "what",
]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

export function selectRelevantSections(
  query: string,
  sections: SectionCandidate[],
  limit = 5
): SectionCandidate[] {
  if (sections.length <= limit) return sections;

  const queryTokens = Array.from(new Set(tokenize(query)));
  if (queryTokens.length === 0) return sections.slice(0, limit);

  const scored = sections.map((section) => {
    const haystack = `${section.title ?? ""} ${section.content}`.toLowerCase();
    let score = 0;

    for (const token of queryTokens) {
      if (haystack.includes(token)) {
        score += 2;
        const occurrences = haystack.split(token).length - 1;
        score += Math.min(occurrences, 4) * 0.5;
      }
      if ((section.title ?? "").toLowerCase().includes(token)) {
        score += 3;
      }
    }

    return { section, score };
  });

  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const top = sorted.slice(0, limit).filter((item) => item.score > 0).map((item) => item.section);

  if (top.length > 0) return top;
  return sections.slice(0, limit);
}

export async function answerDocumentQuestion(params: {
  documentTitle: string;
  question: string;
  sections: SectionCandidate[];
  history: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<{ answer: string; sourceSectionIds: string[] }> {
  const relevant = selectRelevantSections(params.question, params.sections, 5);

  const contextText = relevant
    .map(
      (section) =>
        `[Bagian ${section.sectionIndex}${section.title ? ` — ${section.title}` : ""}]\n${truncateText(section.content, 2400)}`
    )
    .join("\n\n");

  const recentHistory = params.history
    .slice(-6)
    .map((msg) => `${msg.role === "user" ? "Pengguna" : "Asisten"}: ${msg.content}`)
    .join("\n");

  const userPrompt = [
    `Judul Dokumen: ${params.documentTitle}`,
    recentHistory ? `Riwayat Percakapan Singkat:\n${recentHistory}` : "",
    `Konteks Bagian Dokumen:\n${contextText}`,
    `Pertanyaan Pengguna:\n${params.question}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const raw = await generateJsonCompletion<unknown>({
    systemPrompt: QA_SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.2,
    maxTokens: 1500,
  });

  const parsed = qaResponseSchema.parse(raw);

  const usedNumbers = new Set(parsed.usedSectionNumbers ?? []);
  const matchedIds = relevant
    .filter((section) => usedNumbers.has(section.sectionIndex))
    .map((section) => section.id);

  return {
    answer: parsed.answer.trim(),
    sourceSectionIds: matchedIds.length > 0 ? matchedIds : relevant.slice(0, 2).map((s) => s.id),
  };
}
