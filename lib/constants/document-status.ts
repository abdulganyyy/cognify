import type { DocumentStatus } from "@/types/database";

export const DOCUMENT_STATUS_VALUES = [
  "uploaded",
  "processing",
  "ready",
  "failed",
] as const satisfies readonly DocumentStatus[];

export const DOCUMENT_STATUS_META: Record<
  DocumentStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
> = {
  uploaded: { label: "Diunggah", variant: "info" },
  processing: { label: "Diproses", variant: "warning" },
  ready: { label: "Siap", variant: "success" },
  failed: { label: "Gagal", variant: "danger" },
};
