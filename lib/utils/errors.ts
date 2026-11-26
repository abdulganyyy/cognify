import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "@/lib/utils/logger";

export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(message: string, status = 400, code = "BAD_REQUEST", details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    const headers: Record<string, string> = {};
    if (
      error.status === 429 &&
      typeof error.details === "object" &&
      error.details !== null &&
      "retryAfterSec" in error.details
    ) {
      headers["Retry-After"] = String(
        (error.details as { retryAfterSec: number }).retryAfterSec
      );
    }

    if (error.status >= 500) {
      logger.error({ err: error, code: error.code }, error.message);
    }

    return NextResponse.json(
      { error: error.message, code: error.code, details: error.details },
      { status: error.status, headers }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: error.issues[0]?.message ?? "Data yang dikirim tidak valid.",
        code: "VALIDATION_ERROR",
        details: error.issues,
      },
      { status: 400 }
    );
  }

  const message =
    error instanceof Error ? error.message : "Terjadi kesalahan internal pada server.";

  logger.error({ err: error }, "Unhandled API error");

  return NextResponse.json(
    { error: message, code: "INTERNAL_SERVER_ERROR" },
    { status: 500 }
  );
}
