import { NextResponse } from "next/server";
import { answerDocumentQuestion } from "@/lib/ai/qa";
import { requireApiUser } from "@/lib/auth/guards";
import {
  getOwnedDocumentOrThrow,
  getOwnedSections,
  logUserActivity,
} from "@/lib/db/documents";
import { AppError, handleApiError } from "@/lib/utils/errors";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { truncateText } from "@/lib/utils/text";
import { sendChatMessageSchema } from "@/lib/validations/chat";
import type { ChatMessageRow, DocumentSectionRow } from "@/types/database";
import type { ChatMessageView } from "@/types/domain";

export const maxDuration = 60;

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

function mapChatMessages(
  messages: ChatMessageRow[],
  sections: DocumentSectionRow[]
): ChatMessageView[] {
  const sectionMap = new Map(sections.map((s) => [s.id, s]));

  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    status: msg.status,
    errorMessage: msg.error_message,
    sourceSections: (msg.source_section_ids ?? [])
      .map((id) => sectionMap.get(id))
      .filter((s): s is DocumentSectionRow => Boolean(s))
      .map((s) => ({
        id: s.id,
        sectionIndex: s.section_index,
        title: s.title,
        excerpt: truncateText(s.content, 180),
      })),
    createdAt: msg.created_at,
  }));
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    const { supabase, user } = await requireApiUser();
    await getOwnedDocumentOrThrow(supabase, documentId, user.id);

    const { data: session } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("document_id", documentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ sessionId: null, messages: [] });
    }

    const [messagesRes, sections] = await Promise.all([
      supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", session.id)
        .order("created_at", { ascending: true }),
      getOwnedSections(supabase, documentId),
    ]);

    return NextResponse.json({
      sessionId: session.id,
      messages: mapChatMessages((messagesRes.data ?? []) as ChatMessageRow[], sections),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    const { supabase, user } = await requireApiUser();
    enforceRateLimit(`ai:${user.id}`, 15, 60_000);
    const doc = await getOwnedDocumentOrThrow(supabase, documentId, user.id);

    const body = await request.json();
    const parsed = sendChatMessageSchema.parse(body);

    const sections = await getOwnedSections(supabase, documentId);
    if (sections.length === 0) {
      throw new AppError(
        "Dokumen belum selesai diekstrak sehingga belum bisa diajak berdiskusi.",
        400,
        "DOCUMENT_NOT_READY"
      );
    }

    let sessionId = parsed.sessionId;
    if (sessionId) {
      const { data: verifiedSession } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("id", sessionId)
        .eq("document_id", documentId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!verifiedSession) {
        throw new AppError(
          "Sesi chat tidak ditemukan untuk dokumen ini.",
          404,
          "CHAT_SESSION_NOT_FOUND"
        );
      }
    } else {
      const { data: existingSession } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("document_id", documentId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingSession) {
        sessionId = existingSession.id;
      } else {
        const { data: createdSession, error: sessionErr } = await supabase
          .from("chat_sessions")
          .insert({
            user_id: user.id,
            document_id: documentId,
            title: doc.title,
            last_message_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (sessionErr || !createdSession) {
          throw new AppError("Gagal membuat sesi chat.", 500, "CHAT_SESSION_ERROR");
        }
        sessionId = createdSession.id;
      }
    }

    const { data: historyData } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(10);

    const { data: userMessageRow, error: userMsgError } = await supabase
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        role: "user",
        content: parsed.message,
        status: "completed",
      })
      .select("*")
      .single();

    if (userMsgError || !userMessageRow) {
      throw new AppError("Gagal menyimpan pesan.", 500, "CHAT_MESSAGE_ERROR");
    }

    const history = (historyData ?? [])
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content as string,
      }));

    let assistantRow: ChatMessageRow;
    try {
      const qaResult = await answerDocumentQuestion({
        documentTitle: doc.title,
        question: parsed.message,
        sections: sections.map((s) => ({
          id: s.id,
          sectionIndex: s.section_index,
          title: s.title,
          content: s.content,
        })),
        history,
      });

      const { data: insertedAssistant, error: assistantError } = await supabase
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          role: "assistant",
          content: qaResult.answer,
          source_section_ids: qaResult.sourceSectionIds,
          status: "completed",
        })
        .select("*")
        .single();

      if (assistantError || !insertedAssistant) {
        throw new AppError("Gagal menyimpan jawaban AI.", 500, "CHAT_ASSISTANT_ERROR");
      }

      assistantRow = insertedAssistant as ChatMessageRow;
    } catch (aiErr) {
      const errMsg =
        aiErr instanceof Error ? aiErr.message : "Gagal mendapatkan jawaban AI.";
      const { data: failedRow } = await supabase
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          role: "assistant",
          content: "Maaf, terjadi kendala saat memproses pertanyaanmu.",
          status: "failed",
          error_message: errMsg,
        })
        .select("*")
        .single();

      if (failedRow) {
        assistantRow = failedRow as ChatMessageRow;
      } else {
        throw aiErr;
      }
    }

    await supabase
      .from("chat_sessions")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", sessionId);

    await logUserActivity(supabase, {
      userId: user.id,
      documentId,
      activityType: "chat_question_asked",
      metadata: { sessionId },
    });

    const mapped = mapChatMessages(
      [userMessageRow as ChatMessageRow, assistantRow],
      sections
    );

    return NextResponse.json({
      sessionId,
      userMessage: mapped[0],
      assistantMessage: mapped[1],
    });
  } catch (error) {
    return handleApiError(error);
  }
}
