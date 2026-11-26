import { afterEach, describe, expect, it } from "vitest";
import { isProcessingLockActive } from "@/lib/ai/pipeline";
import { MAX_PDF_SIZE_BYTES } from "@/lib/constants/app";
import { AppError } from "@/lib/utils/errors";
import {
  enforceRateLimit,
  resetRateLimitBucketsForTest,
} from "@/lib/utils/rate-limit";
import { sendChatMessageSchema } from "@/lib/validations/chat";
import { signedUrlRequestSchema } from "@/lib/validations/document";

afterEach(() => {
  resetRateLimitBucketsForTest();
});

describe("enforceRateLimit", () => {
  it("allows requests within limit and throws 429 when exceeded", () => {
    enforceRateLimit("user-1", 2, 60_000);
    enforceRateLimit("user-1", 2, 60_000);

    try {
      enforceRateLimit("user-1", 2, 60_000);
      expect.unreachable("Should have thrown rate limit error");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).status).toBe(429);
      expect((err as AppError).code).toBe("RATE_LIMIT_EXCEEDED");
    }
  });
});

describe("validation schemas", () => {
  it("validates PDF signed-url request size and extension", () => {
    expect(
      signedUrlRequestSchema.safeParse({
        fileName: "modul-kuliah.pdf",
        fileSizeBytes: 1024 * 1024,
        mimeType: "application/pdf",
      }).success
    ).toBe(true);

    expect(
      signedUrlRequestSchema.safeParse({
        fileName: "catatan.docx",
        fileSizeBytes: 1024,
        mimeType: "application/pdf",
      }).success
    ).toBe(false);

    expect(
      signedUrlRequestSchema.safeParse({
        fileName: "besar.pdf",
        fileSizeBytes: MAX_PDF_SIZE_BYTES + 1,
        mimeType: "application/pdf",
      }).success
    ).toBe(false);
  });

  it("rejects empty chat messages", () => {
    expect(sendChatMessageSchema.safeParse({ message: "   " }).success).toBe(false);
    expect(
      sendChatMessageSchema.safeParse({ message: "Jelaskan bab 1" }).success
    ).toBe(true);
  });
});

describe("isProcessingLockActive", () => {
  it("detects active vs stale processing locks", () => {
    const fresh = new Date(Date.now() - 30_000).toISOString();
    const stale = new Date(Date.now() - 5 * 60_000).toISOString();

    expect(isProcessingLockActive({ status: "processing", updated_at: fresh })).toBe(true);
    expect(isProcessingLockActive({ status: "processing", updated_at: stale })).toBe(false);
    expect(isProcessingLockActive({ status: "ready", updated_at: fresh })).toBe(false);
  });
});
