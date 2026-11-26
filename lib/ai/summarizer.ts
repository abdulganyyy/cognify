import { z } from "zod";
import { AI_MODEL, generateJsonCompletion } from "@/lib/ai/client";
import { SUMMARY_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { truncateText } from "@/lib/utils/text";

const summaryResponseSchema = z.object({
  shortSummary: z.string().min(10),
  fullSummary: z.string().min(20),
});

export interface GeneratedSummary {
  shortSummary: string;
  fullSummary: string;
  modelName: string;
}

export async function generateDocumentSummary(params: {
  title: string;
  text: string;
}): Promise<GeneratedSummary> {
  const excerpt = truncateText(params.text, 28000);
  let resolvedModel = AI_MODEL;

  const raw = await generateJsonCompletion<unknown>({
    systemPrompt: SUMMARY_SYSTEM_PROMPT,
    userPrompt: `Judul Dokumen: ${params.title}\n\nIsi Dokumen:\n${excerpt}`,
    temperature: 0.3,
    maxTokens: 2200,
    onModelResolved: (model) => {
      resolvedModel = model;
    },
  });

  const parsed = summaryResponseSchema.parse(raw);

  return {
    shortSummary: parsed.shortSummary.trim(),
    fullSummary: parsed.fullSummary.trim(),
    modelName: resolvedModel,
  };
}
