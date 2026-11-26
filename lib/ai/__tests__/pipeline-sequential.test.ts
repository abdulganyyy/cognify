import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DocumentRow } from "@/types/database";

const {
  mockDownloadPdf,
  mockParsePdf,
  mockBuildSections,
  mockGenerateSummary,
  mockGenerateTopics,
  mockGenerateFlashcards,
} = vi.hoisted(() => ({
  mockDownloadPdf: vi.fn(),
  mockParsePdf: vi.fn(),
  mockBuildSections: vi.fn(),
  mockGenerateSummary: vi.fn(),
  mockGenerateTopics: vi.fn(),
  mockGenerateFlashcards: vi.fn(),
}));

vi.mock("@/lib/storage/documents", () => ({
  downloadDocumentPdfBuffer: mockDownloadPdf,
}));

vi.mock("@/lib/pdf/parse", () => ({
  parsePdfBuffer: mockParsePdf,
}));

vi.mock("@/lib/pdf/sectioning", () => ({
  buildDocumentSections: mockBuildSections,
}));

vi.mock("@/lib/ai/summarizer", () => ({
  generateDocumentSummary: mockGenerateSummary,
}));

vi.mock("@/lib/ai/topics", () => ({
  generateDocumentTopics: mockGenerateTopics,
}));

vi.mock("@/lib/ai/flashcards", () => ({
  generateDocumentFlashcards: mockGenerateFlashcards,
}));

import {
  PIPELINE_STEP_DELAY_MS,
  processFullDocumentPipeline,
} from "@/lib/ai/pipeline";

function createMockSupabase() {
  const insertedSections = [
    {
      id: "sec-1",
      document_id: "doc-1",
      section_index: 1,
      title: "Bagian 1",
      content: "Isi materi pengujian yang cukup panjang.",
      page_start: 1,
      page_end: 1,
      char_start: 0,
      char_end: 40,
      token_count: 10,
      embedding_status: "ready",
      created_at: new Date().toISOString(),
    },
  ];

  const makeChain = () => {
    const chain: Record<string, unknown> = {};
    const returnChain = () => chain;
    chain.update = vi.fn(returnChain);
    chain.delete = vi.fn(returnChain);
    chain.eq = vi.fn(returnChain);
    chain.order = vi.fn(returnChain);
    chain.limit = vi.fn(async () => ({ data: [], error: null }));
    chain.insert = vi.fn(() => ({
      select: vi.fn(async () => ({ data: insertedSections, error: null })),
      then: (resolve: (val: { error: null }) => void) => resolve({ error: null }),
    }));
    chain.select = vi.fn(returnChain);
    chain.then = (resolve: (val: { data: unknown[]; error: null }) => void) =>
      resolve({ data: [], error: null });
    return chain;
  };

  return {
    from: vi.fn(() => makeChain()),
  } as unknown as SupabaseClient;
}

describe("processFullDocumentPipeline sequential execution", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockDownloadPdf.mockResolvedValue(Buffer.from("pdf"));
    mockParsePdf.mockResolvedValue({
      pageCount: 1,
      rawText: "Isi materi pengujian yang cukup panjang untuk diringkas dan dianalisis.",
      pages: [{ pageNumber: 1, text: "Isi materi pengujian." }],
    });
    mockBuildSections.mockReturnValue([
      {
        sectionIndex: 1,
        title: "Bagian 1",
        content: "Isi materi pengujian.",
        pageStart: 1,
        pageEnd: 1,
        charStart: 0,
        charEnd: 21,
        tokenCount: 5,
      },
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("runs summary, topics, and flashcards sequentially with 1-2s delay between steps", async () => {
    const events: string[] = [];
    let activeCount = 0;
    let maxConcurrent = 0;

    const trackStep = async <T>(name: string, value: T): Promise<T> => {
      activeCount += 1;
      maxConcurrent = Math.max(maxConcurrent, activeCount);
      events.push(`start:${name}`);
      await Promise.resolve();
      events.push(`end:${name}`);
      activeCount -= 1;
      return value;
    };

    mockGenerateSummary.mockImplementation(() =>
      trackStep("summary", {
        shortSummary: "Ringkasan singkat materi.",
        fullSummary: "Ringkasan lengkap materi pembelajaran dokumen.",
        modelName: "google/gemma-4-26b-a4b-it:free",
      })
    );
    mockGenerateTopics.mockImplementation(() =>
      trackStep("topics", [
        {
          name: "Topik 1",
          description: "Deskripsi topik pertama.",
          topicOrder: 1,
          importanceScore: 1,
          sectionNumber: 1,
        },
      ])
    );
    mockGenerateFlashcards.mockImplementation(() =>
      trackStep("flashcards", [
        {
          question: "Apa topik utama?",
          answer: "Topik 1",
          difficulty: "easy",
          sourceExcerpt: null,
          sectionNumber: 1,
          cardOrder: 1,
        },
      ])
    );

    const supabase = createMockSupabase();
    const doc = {
      id: "doc-1",
      user_id: "user-1",
      title: "Dokumen Uji",
      storage_path: "user-1/doc.pdf",
      status: "uploaded",
      updated_at: new Date().toISOString(),
    } as DocumentRow;

    expect(PIPELINE_STEP_DELAY_MS).toBeGreaterThanOrEqual(1000);
    expect(PIPELINE_STEP_DELAY_MS).toBeLessThanOrEqual(2000);

    const pipelinePromise = processFullDocumentPipeline(supabase, doc);

    // Flush initial async steps until waiting on first inter-step delay
    await vi.advanceTimersByTimeAsync(0);
    expect(events).toEqual(["start:summary", "end:summary"]);

    // Topics should not start before PIPELINE_STEP_DELAY_MS elapses
    await vi.advanceTimersByTimeAsync(PIPELINE_STEP_DELAY_MS - 1);
    expect(events).toEqual(["start:summary", "end:summary"]);

    await vi.advanceTimersByTimeAsync(1);
    expect(events).toEqual([
      "start:summary",
      "end:summary",
      "start:topics",
      "end:topics",
    ]);

    // Flashcards starts after the second inter-step delay
    await vi.advanceTimersByTimeAsync(PIPELINE_STEP_DELAY_MS);
    const result = await pipelinePromise;

    expect(result).toEqual({ status: "ready", warnings: [] });
    expect(maxConcurrent).toBe(1);
    expect(events).toEqual([
      "start:summary",
      "end:summary",
      "start:topics",
      "end:topics",
      "start:flashcards",
      "end:flashcards",
    ]);
  });
});
