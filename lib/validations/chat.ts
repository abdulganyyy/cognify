import { z } from "zod";

export const sendChatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Pertanyaan tidak boleh kosong.")
    .max(2000, "Pertanyaan maksimal 2000 karakter."),
  sessionId: z.string().uuid().optional(),
});
