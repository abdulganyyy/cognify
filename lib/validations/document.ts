import { z } from "zod";
import { ALLOWED_PDF_MIME_TYPES, MAX_PDF_SIZE_BYTES } from "@/lib/constants/app";

export const signedUrlRequestSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, "Nama file wajib diisi.")
    .refine((name) => name.toLowerCase().endsWith(".pdf"), {
      message: "Hanya file PDF yang didukung.",
    }),
  fileSizeBytes: z
    .number()
    .int()
    .positive("Ukuran file tidak valid.")
    .max(MAX_PDF_SIZE_BYTES, "Ukuran file maksimal 10 MB."),
  mimeType: z
    .string()
    .refine(
      (type) =>
        type === "" ||
        (ALLOWED_PDF_MIME_TYPES as readonly string[]).includes(type),
      { message: "Tipe file harus PDF (application/pdf)." }
    ),
});

export const createDocumentSchema = z.object({
  documentId: z.string().uuid("ID dokumen tidak valid."),
  title: z.string().trim().min(1, "Judul dokumen wajib diisi.").max(200),
  originalFileName: z.string().trim().min(1).max(255),
  storagePath: z.string().trim().min(1),
  fileSizeBytes: z.number().int().positive().max(MAX_PDF_SIZE_BYTES),
  mimeType: z.string().default("application/pdf"),
});

export const updateDocumentSchema = z.object({
  title: z.string().trim().min(1, "Judul dokumen wajib diisi.").max(200),
});

export const createFlashcardSchema = z.object({
  action: z.enum(["create", "regenerate"]).default("create"),
  question: z.string().trim().min(1, "Pertanyaan wajib diisi.").max(1000).optional(),
  answer: z.string().trim().min(1, "Jawaban wajib diisi.").max(2000).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

export const updateFlashcardSchema = z.object({
  question: z.string().trim().min(1).max(1000).optional(),
  answer: z.string().trim().min(1).max(2000).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).nullable().optional(),
});

export const toggleBookmarkSchema = z.object({
  documentId: z.string().uuid(),
  bookmarkType: z.enum(["document", "summary", "section", "topic", "flashcard", "text"]),
  topicId: z.string().uuid().optional().nullable(),
  flashcardId: z.string().uuid().optional().nullable(),
  sectionId: z.string().uuid().optional().nullable(),
  highlightedText: z.string().max(1000).optional().nullable(),
  note: z.string().max(1000).optional().nullable(),
});
