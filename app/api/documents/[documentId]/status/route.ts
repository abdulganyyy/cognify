import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/guards";
import { getOwnedDocumentOrThrow } from "@/lib/db/documents";
import { handleApiError } from "@/lib/utils/errors";

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    const { supabase, user } = await requireApiUser();
    const doc = await getOwnedDocumentOrThrow(supabase, documentId, user.id);

    return NextResponse.json({
      id: doc.id,
      status: doc.status,
      summaryStatus: doc.summary_status,
      topicStatus: doc.topic_status,
      flashcardStatus: doc.flashcard_status,
      processingError: doc.processing_error,
      textExtracted: doc.text_extracted,
      pageCount: doc.page_count,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
