import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/guards";
import { listUserDocuments, logUserActivity } from "@/lib/db/documents";
import { assertDocumentExistsInStorage } from "@/lib/storage/documents";
import { AppError, handleApiError } from "@/lib/utils/errors";
import { createDocumentSchema } from "@/lib/validations/document";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireApiUser();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") ?? undefined;

    const documents = await listUserDocuments(supabase, user.id, search);
    return NextResponse.json({ documents });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireApiUser();
    const body = await request.json();
    const parsed = createDocumentSchema.parse(body);

    const expectedPrefix = `users/${user.id}/${parsed.documentId}/`;
    if (!parsed.storagePath.startsWith(expectedPrefix)) {
      throw new AppError("Path penyimpanan dokumen tidak valid.", 403, "INVALID_STORAGE_PATH");
    }

    await assertDocumentExistsInStorage(parsed.storagePath);

    const { data, error } = await supabase
      .from("documents")
      .insert({
        id: parsed.documentId,
        user_id: user.id,
        title: parsed.title,
        original_file_name: parsed.originalFileName,
        storage_path: parsed.storagePath,
        file_size_bytes: parsed.fileSizeBytes,
        mime_type: parsed.mimeType || "application/pdf",
        status: "uploaded",
        summary_status: "pending",
        topic_status: "pending",
        flashcard_status: "pending",
        language: "id",
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new AppError(
        error?.message ?? "Gagal menyimpan data dokumen.",
        500,
        "DOCUMENT_CREATE_ERROR"
      );
    }

    await logUserActivity(supabase, {
      userId: user.id,
      documentId: data.id,
      activityType: "document_uploaded",
      metadata: { title: data.title },
    });

    return NextResponse.json({ document: data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
