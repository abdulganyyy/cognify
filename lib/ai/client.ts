import OpenAI from "openai";
import { AppError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

export const DEFAULT_PRIMARY_MODEL = "google/gemma-4-26b-a4b-it:free";

export const AI_FALLBACK_MODELS = [
  "google/gemma-4-26b-a4b-it:free",
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3.5-super-vl:free",
  "inclusionai/ling-3.2-flash:free",
  "openrouter/free",
] as const;

export const AI_MODEL =
  process.env.OPENROUTER_MODEL?.trim() || DEFAULT_PRIMARY_MODEL;

export function getAiModelCandidates(): string[] {
  const primary = process.env.OPENROUTER_MODEL?.trim() || AI_MODEL;
  const envFallbacks = (process.env.OPENROUTER_FALLBACK_MODELS ?? "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  return Array.from(
    new Set([primary, ...envFallbacks, ...AI_FALLBACK_MODELS])
  );
}

const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL?.trim() || "https://openrouter.ai/api/v1";

const AI_TIMEOUT_MS = 45_000;
const MIN_RETRY_ATTEMPTS = 5;

let cachedClient: OpenAI | null = null;

export function getAiClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new AppError(
      "OPENROUTER_API_KEY belum dikonfigurasi di server.",
      500,
      "MISSING_AI_API_KEY"
    );
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey,
      baseURL: OPENROUTER_BASE_URL,
      timeout: AI_TIMEOUT_MS,
      maxRetries: 0,
      defaultHeaders: {
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000",
        "X-Title": "Cognify",
      },
    });
  }

  return cachedClient;
}

function extractJsonText(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  const objectMatch = raw.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return objectMatch[0].trim();
  }
  return raw.trim();
}

function getHttpStatus(err: unknown): number | undefined {
  if (typeof err === "object" && err !== null && "status" in err) {
    const status = (err as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  return undefined;
}

function isRetryableError(err: unknown): boolean {
  const status = getHttpStatus(err);
  if (status === 408 || status === 429 || (status !== undefined && status >= 500)) {
    return true;
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("timeout") ||
      msg.includes("timed out") ||
      msg.includes("rate limit") ||
      msg.includes("econnreset") ||
      msg.includes("fetch failed")
    );
  }
  return false;
}

function isUnsupportedResponseFormatError(err: unknown): boolean {
  const status = getHttpStatus(err);
  if (status !== 400 && status !== 422) return false;
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  return msg.includes("response_format") || msg.includes("json_object");
}

function isUnsupportedRoutingParamError(err: unknown): boolean {
  const status = getHttpStatus(err);
  if (status !== 400 && status !== 422) return false;
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  return msg.includes("route") || msg.includes("models");
}

function getRetryAfterMs(err: unknown): number | undefined {
  if (typeof err !== "object" || err === null || !("headers" in err)) {
    return undefined;
  }
  const headers = (err as { headers?: unknown }).headers;
  let rawRetryAfter: string | null | undefined;
  if (headers && typeof (headers as Headers).get === "function") {
    rawRetryAfter = (headers as Headers).get("retry-after");
  } else if (headers && typeof headers === "object") {
    const record = headers as Record<string, unknown>;
    const val = record["retry-after"] ?? record["Retry-After"];
    if (typeof val === "string") rawRetryAfter = val;
  }
  if (!rawRetryAfter) return undefined;
  const seconds = Number(rawRetryAfter);
  if (!Number.isFinite(seconds) || seconds <= 0) return undefined;
  return Math.min(Math.max(Math.round(seconds * 1000), 500), 3000);
}

function getRetryDelayMs(attempt: number, err: unknown): number {
  const retryAfterMs = getRetryAfterMs(err);
  if (retryAfterMs !== undefined) return retryAfterMs;
  return 1000 + (attempt - 1) * 400 + Math.floor(Math.random() * 350);
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type OpenRouterChatPayload =
  OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming & {
    models?: string[];
    route?: "fallback";
  };

/**
 * Generates a parsed JSON completion via OpenRouter using primary + fallback
 * `:free` models (`models` + `route: "fallback"` and client-side model rotation on 429/errors).
 */
export async function generateJsonCompletion<T>(params: {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  onModelResolved?: (model: string) => void;
}): Promise<T> {
  const client = getAiClient();
  const candidates = getAiModelCandidates();
  const maxAttempts = Math.max(candidates.length + 2, MIN_RETRY_ATTEMPTS);

  let modelIndex = 0;
  let useJsonMode = true;
  let useRoutingFallback = candidates.length > 1;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const currentModel = candidates[modelIndex] ?? AI_MODEL;
    const fallbackModels = [
      ...candidates.slice(modelIndex),
      ...candidates.slice(0, modelIndex),
    ].slice(0, 3);

    const payload: OpenRouterChatPayload = {
      model: currentModel,
      temperature: params.temperature ?? 0.3,
      max_tokens: params.maxTokens ?? 2500,
      messages: [
        { role: "system" as const, content: params.systemPrompt },
        { role: "user" as const, content: params.userPrompt },
      ],
      ...(useRoutingFallback && fallbackModels.length > 1
        ? { models: fallbackModels, route: "fallback" as const }
        : {}),
      ...(useJsonMode ? { response_format: { type: "json_object" as const } } : {}),
    };

    try {
      const response = await client.chat.completions.create(
        payload as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming
      );

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError("AI tidak mengembalikan respons.", 502, "EMPTY_AI_RESPONSE");
      }

      const candidate = extractJsonText(content);
      let parsed: T;
      try {
        parsed = JSON.parse(candidate) as T;
      } catch {
        throw new AppError("Format respons AI tidak valid.", 502, "INVALID_AI_JSON");
      }

      const resolvedModel =
        typeof response.model === "string" && response.model.trim()
          ? response.model.trim()
          : currentModel;
      params.onModelResolved?.(resolvedModel);

      if (attempt > 1 || resolvedModel !== candidates[0]) {
        logger.info(
          { attempt, requestedModel: currentModel, resolvedModel },
          "OpenRouter AI completion succeeded via fallback"
        );
      }

      return parsed;
    } catch (error) {
      lastError = error;

      if (useJsonMode && isUnsupportedResponseFormatError(error)) {
        useJsonMode = false;
        continue;
      }

      if (useRoutingFallback && isUnsupportedRoutingParamError(error)) {
        useRoutingFallback = false;
        continue;
      }

      const isModelUnavailable =
        getHttpStatus(error) === 404 && candidates.length > 1;
      const shouldRetry =
        attempt < maxAttempts &&
        (isRetryableError(error) ||
          isModelUnavailable ||
          (error instanceof AppError &&
            (error.code === "EMPTY_AI_RESPONSE" || error.code === "INVALID_AI_JSON")));

      if (!shouldRetry) break;

      const nextModelIndex = (modelIndex + 1) % candidates.length;
      const nextModel = candidates[nextModelIndex] ?? AI_MODEL;
      const backoffMs = getRetryDelayMs(attempt, error);

      logger.warn(
        {
          attempt,
          backoffMs,
          failedModel: currentModel,
          nextModel,
          status: getHttpStatus(error),
          err: error instanceof Error ? error.message : error,
        },
        "Retrying OpenRouter AI completion with fallback model"
      );

      modelIndex = nextModelIndex;
      useJsonMode = true;
      await sleep(backoffMs);
    }
  }

  if (lastError instanceof AppError) throw lastError;

  const status = getHttpStatus(lastError);
  if (status === 429) {
    throw new AppError(
      "Layanan AI sedang sibuk (rate limit OpenRouter). Coba lagi dalam beberapa saat.",
      429,
      "AI_RATE_LIMITED"
    );
  }

  throw new AppError(
    lastError instanceof Error
      ? `Gagal memanggil AI: ${lastError.message}`
      : "Gagal memanggil layanan AI.",
    502,
    "AI_REQUEST_FAILED"
  );
}
