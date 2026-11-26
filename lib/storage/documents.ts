import { STORAGE_DOCUMENTS_BUCKET } from "@/lib/constants/app";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppError } from "@/lib/utils/errors";
import { sanitizeFileName } from "@/lib/utils/text";

export function buildDocumentStoragePath(
  userId: string,
  documentId: string,
  fileName: string
): string {
  const safeName = sanitizeFileName(fileName);
  return `users/${userId}/${documentId}/${safeName}`;
}

export async function createDocumentSignedUploadUrl(storagePath: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(STORAGE_DOCUMENTS_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    throw new AppError(
      error?.message ?? "Gagal membuat URL unggahan dokumen.",
      500,
      "STORAGE_SIGNED_URL_ERROR"
    );
  }

  return data;
}

export async function downloadDocumentPdfBuffer(storagePath: string): Promise<Buffer> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(STORAGE_DOCUMENTS_BUCKET)
    .download(storagePath);

  if (error || !data) {
    throw new AppError(
      error?.message ?? "Gagal mengunduh file PDF dari penyimpanan.",
      500,
      "STORAGE_DOWNLOAD_ERROR"
    );
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function assertDocumentExistsInStorage(
  storagePath: string
): Promise<void> {
  const lastSlash = storagePath.lastIndexOf("/");
  const folder = lastSlash >= 0 ? storagePath.slice(0, lastSlash) : "";
  const fileName = lastSlash >= 0 ? storagePath.slice(lastSlash + 1) : storagePath;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(STORAGE_DOCUMENTS_BUCKET)
    .list(folder, { limit: 10, search: fileName });

  if (error) {
    throw new AppError(
      "Gagal memverifikasi file di penyimpanan.",
      500,
      "STORAGE_VERIFY_ERROR"
    );
  }

  const found = (data ?? []).some((item) => item.name === fileName);
  if (!found) {
    throw new AppError(
      "File PDF belum ditemukan di penyimpanan. Silakan unggah ulang.",
      400,
      "STORAGE_FILE_NOT_FOUND"
    );
  }
}

export async function deleteDocumentFromStorage(storagePath: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(STORAGE_DOCUMENTS_BUCKET)
    .remove([storagePath]);

  if (error) {
    throw new AppError(
      error.message ?? "Gagal menghapus file dari penyimpanan.",
      500,
      "STORAGE_DELETE_ERROR"
    );
  }
}
