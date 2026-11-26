import { NextResponse } from "next/server";
import { processFullDocumentPipeline } from "@/lib/ai/pipeline";
import { requireApiUser } from "@/lib/auth/guards";
import { getOwnedDocumentOrThrow, logUserActivity } from "@/lib/db/documents";
import { handleApiError } from "@/lib/utils/errors";
import { enforceRateLimit } from "@/lib/utils/rate-limit";

export const maxDuration = 60;

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    const { supabase, user } = await requireApiUser();
    enforceRateLimit(`ai:${user.id}`, 15, 60_000);
    const doc = await getOwnedDocumentOrThrow(supabase, documentId, user.id);

    const result = await processFullDocumentPipeline(supabase, doc);

    await logUserActivity(supabase, {
      userId: user.id,
      documentId: doc.id,
      activityType: "document_processed",
      metadata: { status: result.status, warnings: result.warnings },
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
