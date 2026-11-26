import { z } from "zod";
import { generateJsonCompletion } from "@/lib/ai/client";
import { TOPICS_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { truncateText } from "@/lib/utils/text";

const topicsResponseSchema = z.object({
  topics: z
    .array(
      z.object({
        name: z.string().min(2).max(150),
        description: z.string().min(5).max(500),
        importanceScore: z.number().min(0).max(1).optional(),
        sectionNumber: z.number().int().positive().optional(),
      })
    )
    .min(1)
    .max(12),
});

export interface GeneratedTopic {
  name: string;
  description: string;
  topicOrder: number;
  importanceScore: number;
  sectionNumber?: number;
}

export async function generateDocumentTopics(params: {
  title: string;
  sections: Array<{ sectionIndex: number; title: string | null; content: string }>;
}): Promise<GeneratedTopic[]> {
  const formattedSections = params.sections
    .map(
      (section) =>
        `[Bagian ${section.sectionIndex}${section.title ? ` — ${section.title}` : ""}]\n${truncateText(section.content, 1600)}`
    )
    .join("\n\n");

  const raw = await generateJsonCompletion<unknown>({
    systemPrompt: TOPICS_SYSTEM_PROMPT,
    userPrompt: `Judul Dokumen: ${params.title}\n\nBagian Dokumen:\n${truncateText(formattedSections, 26000)}`,
    temperature: 0.3,
    maxTokens: 1800,
  });

  const parsed = topicsResponseSchema.parse(raw);

  return parsed.topics.map((topic, index) => ({
    name: topic.name.trim(),
    description: topic.description.trim(),
    topicOrder: index + 1,
    importanceScore: Number((topic.importanceScore ?? Math.max(0.5, 1 - index * 0.08)).toFixed(2)),
    sectionNumber: topic.sectionNumber,
  }));
}
