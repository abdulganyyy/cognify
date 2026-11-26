import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/guards";
import {
  getDocumentDetailView,
  getOwnedDocumentOrThrow,
  logUserActivity,
} from "@/lib/db/documents";
import { deleteDocumentFromStorage } from "@/lib/storage/documents";
import { AppError, handleApiError } from "@/lib/utils/errors";
import { updateDocumentSchema } from "@/lib/validations/document";

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    const { supabase, user } = await requireApiUser();

    const detail = await getDocumentDetailView(supabase, documentId, user.id);

    await supabase
      .from("documents")
      .update({ last_opened_at: new Date().toISOString() })
      .eq("id", documentId)
      .eq("user_id", user.id);

    return NextResponse.json({ document: detail });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    const { supabase, user } = await requireApiUser();
    await getOwnedDocumentOrThrow(supabase, documentId, user.id);

    const body = await request.json();
    const parsed = updateDocumentSchema.parse(body);

    const { data, error } = await supabase
      .from("documents")
      .update({ title: parsed.title })
      .eq("id", documentId)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error || !data) {
      throw new AppError("Gagal memperbarui judul dokumen.", 500, "DOCUMENT_UPDATE_ERROR");
    }

    return NextResponse.json({ document: data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    const { supabase, user } = await requireApiUser();
    const doc = await getOwnedDocumentOrThrow(supabase, documentId, user.id);

    await deleteDocumentFromStorage(doc.storage_path).catch(() => undefined);

    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId)
      .eq("user_id", user.id);

    if (error) {
      throw new AppError("Gagal menghapus dokumen.", 500, "DOCUMENT_DELETE_ERROR");
    }

    await logUserActivity(supabase, {
      userId: user.id,
      documentId: null,
      activityType: "document_deleted",
      metadata: { title: doc.title },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
