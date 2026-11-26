import type { ProcessingStatus } from "@/types/database";

export const PROCESSING_STATUS_VALUES = [
  "pending",
  "processing",
  "ready",
  "failed",
] as const satisfies readonly ProcessingStatus[];

export const PROCESSING_STATUS_LABELS: Record<ProcessingStatus, string> = {
  pending: "Menunggu",
  processing: "Sedang diproses",
  ready: "Selesai",
  failed: "Gagal",
};
