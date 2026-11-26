import OpenAI from "openai";
import { AppError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

export const AI_MODEL =
  process.env.OPENROUTER_MODEL?.trim() || "openrouter/free";

const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL?.trim() || "https://openrouter.ai/api/v1";

const AI_TIMEOUT_MS = 45_000;
const MAX_RETRY_ATTEMPTS = 3;

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
  if (status === 429 || (status !== undefined && status >= 500)) {
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateJsonCompletion<T>(params: {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<T> {
  const client = getAiClient();

  const basePayload = {
    model: AI_MODEL,
    temperature: params.temperature ?? 0.3,
    max_tokens: params.maxTokens ?? 2500,
    messages: [
      { role: "system" as const, content: params.systemPrompt },
      { role: "user" as const, content: params.userPrompt },
    ],
  };

  let useJsonMode = true;
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await client.chat.completions.create(
        useJsonMode
          ? { ...basePayload, response_format: { type: "json_object" } }
          : basePayload
      );

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AppError("AI tidak mengembalikan respons.", 502, "EMPTY_AI_RESPONSE");
      }

      const candidate = extractJsonText(content);
      try {
        return JSON.parse(candidate) as T;
      } catch {
        throw new AppError("Format respons AI tidak valid.", 502, "INVALID_AI_JSON");
      }
    } catch (error) {
      lastError = error;

      if (useJsonMode && isUnsupportedResponseFormatError(error)) {
        useJsonMode = false;
        continue;
      }

      const shouldRetry =
        attempt < MAX_RETRY_ATTEMPTS &&
        (isRetryableError(error) ||
          (error instanceof AppError &&
            (error.code === "EMPTY_AI_RESPONSE" || error.code === "INVALID_AI_JSON")));

      if (!shouldRetry) break;

      const backoffMs = 1000 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 400);
      logger.warn(
        { attempt, backoffMs, model: AI_MODEL, err: error instanceof Error ? error.message : error },
        "Retrying OpenRouter AI completion"
      );
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
