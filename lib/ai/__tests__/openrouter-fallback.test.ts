import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}));

vi.mock("openai", () => {
  class MockOpenAI {
    chat = {
      completions: {
        create: mockCreate,
      },
    };
  }
  return { default: MockOpenAI };
});

import {
  AI_FALLBACK_MODELS,
  DEFAULT_PRIMARY_MODEL,
  generateJsonCompletion,
  getAiModelCandidates,
} from "@/lib/ai/client";

describe("OpenRouter fallback & rate-limit retry", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.useFakeTimers();
    mockCreate.mockReset();
    process.env.OPENROUTER_API_KEY = "test-key";
    delete process.env.OPENROUTER_MODEL;
    delete process.env.OPENROUTER_FALLBACK_MODELS;
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env = { ...originalEnv };
  });

  it("builds deduplicated candidate list starting with primary :free model", () => {
    const candidates = getAiModelCandidates();
    expect(candidates[0]).toBe(DEFAULT_PRIMARY_MODEL);
    expect(candidates.length).toBeGreaterThanOrEqual(3);
    expect(new Set(candidates).size).toBe(candidates.length);
    for (const fallback of AI_FALLBACK_MODELS) {
      expect(candidates).toContain(fallback);
    }
  });

  it("includes OpenRouter models + route: 'fallback' and rotates models on 429", async () => {
    const rateLimitError = Object.assign(new Error("429 Too Many Requests"), {
      status: 429,
    });

    mockCreate
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce({
        model: AI_FALLBACK_MODELS[1],
        choices: [{ message: { content: '{"ok":true}' } }],
      });

    let resolvedModel = "";
    const promise = generateJsonCompletion<{ ok: boolean }>({
      systemPrompt: "sys",
      userPrompt: "usr",
      onModelResolved: (model) => {
        resolvedModel = model;
      },
    });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toEqual({ ok: true });
    expect(resolvedModel).toBe(AI_FALLBACK_MODELS[1]);
    expect(mockCreate).toHaveBeenCalledTimes(2);

    const firstCallPayload = mockCreate.mock.calls[0]?.[0];
    expect(firstCallPayload.model).toBe(AI_FALLBACK_MODELS[0]);
    expect(firstCallPayload.route).toBe("fallback");
    expect(firstCallPayload.models).toEqual(AI_FALLBACK_MODELS.slice(0, 3));

    const secondCallPayload = mockCreate.mock.calls[1]?.[0];
    expect(secondCallPayload.model).toBe(AI_FALLBACK_MODELS[1]);
    expect(secondCallPayload.route).toBe("fallback");
  });

  it("strips unsupported routing params without rotating model and succeeds", async () => {
    const unsupportedRoutingErr = Object.assign(
      new Error("400 Invalid parameter: route and models are not supported"),
      { status: 400 }
    );

    mockCreate
      .mockRejectedValueOnce(unsupportedRoutingErr)
      .mockResolvedValueOnce({
        model: AI_FALLBACK_MODELS[0],
        choices: [{ message: { content: '{"ok":true}' } }],
      });

    const result = await generateJsonCompletion<{ ok: boolean }>({
      systemPrompt: "sys",
      userPrompt: "usr",
    });

    expect(result).toEqual({ ok: true });
    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(mockCreate.mock.calls[1]?.[0].model).toBe(AI_FALLBACK_MODELS[0]);
    expect(mockCreate.mock.calls[1]?.[0].route).toBeUndefined();
    expect(mockCreate.mock.calls[1]?.[0].models).toBeUndefined();
  });

  it("throws AI_RATE_LIMITED when all attempts return 429", async () => {
    const rateLimitError = Object.assign(new Error("429 Too Many Requests"), {
      status: 429,
    });
    mockCreate.mockRejectedValue(rateLimitError);

    const promise = generateJsonCompletion<{ ok: boolean }>({
      systemPrompt: "sys",
      userPrompt: "usr",
    });

    await Promise.all([
      expect(promise).rejects.toMatchObject({
        status: 429,
        code: "AI_RATE_LIMITED",
      }),
      vi.runAllTimersAsync(),
    ]);

    expect(mockCreate.mock.calls.length).toBeGreaterThanOrEqual(AI_FALLBACK_MODELS.length);
  });
});
