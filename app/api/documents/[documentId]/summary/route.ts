import { NextResponse } from "next/server";
import { runSummaryGeneration } from "@/lib/ai/pipeline";
import { requireApiUser } from "@/lib/auth/guards";
import { getOwnedDocumentOrThrow } from "@/lib/db/documents";
import { handleApiError } from "@/lib/utils/errors";
import { enforceRateLimit } from "@/lib/utils/rate-limit";

export const maxDuration = 60;

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    const { supabase, user } = await requireApiUser();
    await getOwnedDocumentOrThrow(supabase, documentId, user.id);

    const { data } = await supabase
      .from("document_summaries")
      .select("*")
      .eq("document_id", documentId)
      .eq("is_active", true);

    return NextResponse.json({ summaries: data ?? [] });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    const { supabase, user } = await requireApiUser();
    enforceRateLimit(`ai:${user.id}`, 15, 60_000);
    const doc = await getOwnedDocumentOrThrow(supabase, documentId, user.id);

    const generated = await runSummaryGeneration(supabase, doc);
    return NextResponse.json(generated);
  } catch (error) {
    return handleApiError(error);
  }
}
