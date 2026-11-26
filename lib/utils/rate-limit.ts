import { AppError } from "@/lib/utils/errors";

interface RateLimitBucket {
  timestamps: number[];
}

const buckets = new Map<string, RateLimitBucket>();

export function enforceRateLimit(
  key: string,
  maxRequests = 15,
  windowMs = 60_000
): void {
  const now = Date.now();
  const windowStart = now - windowMs;
  const bucket = buckets.get(key) ?? { timestamps: [] };

  bucket.timestamps = bucket.timestamps.filter((ts) => ts > windowStart);

  if (bucket.timestamps.length >= maxRequests) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    throw new AppError(
      `Terlalu banyak permintaan AI. Silakan coba lagi dalam ${retryAfterSec} detik.`,
      429,
      "RATE_LIMIT_EXCEEDED",
      { retryAfterSec }
    );
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);

  // Cegah pertumbuhan map tanpa batas pada proses jangka panjang
  if (buckets.size > 1000) {
    for (const [entryKey, entry] of buckets.entries()) {
      if (entry.timestamps.every((ts) => ts <= windowStart)) {
        buckets.delete(entryKey);
      }
    }
  }
}

export function resetRateLimitBucketsForTest(): void {
  buckets.clear();
}
