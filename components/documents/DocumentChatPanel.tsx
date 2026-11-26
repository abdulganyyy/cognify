"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronRight, Loader2, MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useDocumentChatQuery, useSendChatMutation } from "@/lib/query/hooks";
import { formatRelativeTime } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import type { ChatMessageView } from "@/types/domain";

interface DocumentChatPanelProps {
  documentId: string;
  isReady: boolean;
  /** "panel" = split-view kanan full-height ala DashboardPreview; "card" = standalone tab di mobile */
  variant?: "panel" | "card";
  draft?: string;
  onDraftChange?: (value: string) => void;
  className?: string;
}

const SUGGESTED_QUESTIONS = [
  "Jelaskan konsep paling penting dari dokumen ini.",
  "Apa saja poin utama untuk persiapan ujian?",
  "Berikan contoh penerapan materi di dokumen ini.",
];

export function DocumentChatPanel({
  documentId,
  isReady,
  variant = "panel",
  draft,
  onDraftChange,
  className,
}: DocumentChatPanelProps) {
  const [internalInput, setInternalInput] = useState("");
  const [selectedCitation, setSelectedCitation] = useState<
    ChatMessageView["sourceSections"][number] | null
  >(null);
  const input = draft !== undefined ? draft : internalInput;
  const setInput = onDraftChange ?? setInternalInput;
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatQuery = useDocumentChatQuery(documentId, isReady);
  const sendMutation = useSendChatMutation(documentId);

  const messages = chatQuery.data?.messages ?? [];
  const sessionId = chatQuery.data?.sessionId ?? undefined;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sendMutation.isPending]);

  const handleSend = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || sendMutation.isPending || !isReady) return;
    if (!text) setInput("");

    await sendMutation.mutateAsync({ message, sessionId });
  };

  const isPanel = variant === "panel";

  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden",
        isPanel
          ? "h-full bg-neutral-50/50"
          : "rounded-xl border border-neutral-100 bg-white",
        className
      )}
    >
      {/* Header ala DashboardPreview */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-neutral-100 bg-white px-4">
        <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
        <h2 className="text-xs font-semibold text-neutral-700">Tanya AI</h2>
        <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-600">
          PDF
        </span>
      </div>

      {!isReady ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <EmptyState
            className="w-full min-h-[220px]"
            icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
            title="Tutor AI belum siap"
            description="Selesaikan pemrosesan dokumen agar kamu bisa berdiskusi dengan Tutor AI."
          />
        </div>
      ) : (
        <>
          {/* Messages */}
          <div
            className={cn(
              "flex-1 overflow-y-auto p-3.5",
              !isPanel && "min-h-[340px] max-h-[460px] bg-neutral-50/40"
            )}
          >
            {chatQuery.isLoading ? (
              <div className="flex h-full min-h-[200px] items-center justify-center text-xs text-neutral-400">
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin text-blue-500" />
                Memuat percakapan…
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-2 py-6 text-center">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold text-neutral-700">
                  Tanya apa saja tentang PDF ini
                </p>
                <p className="mt-1 max-w-[240px] text-[11px] leading-relaxed text-neutral-400">
                  Jawaban diambil langsung dari isi materimu. Pilih pertanyaan cepat atau ketik sendiri.
                </p>
                <div className="mt-4 flex flex-col gap-1.5 w-full">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void handleSend(q)}
                      className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-left text-[11px] leading-snug text-neutral-600 transition-colors hover:border-blue-200 hover:bg-blue-50/40 hover:text-blue-700"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col gap-1",
                        isUser ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[88%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line",
                          isUser
                            ? "rounded-tr-sm bg-blue-600 text-white"
                            : msg.status === "failed"
                              ? "rounded-tl-sm border border-red-200 bg-red-50 text-red-700"
                              : "rounded-tl-sm border border-neutral-200 bg-white text-neutral-700"
                        )}
                      >
                        {msg.content}
                      </div>

                      {!isUser && msg.sourceSections.length > 0 && (
                        <div className="flex max-w-[88%] flex-wrap gap-1">
                          {msg.sourceSections.map((sec) => (
                            <button
                              key={sec.id}
                              type="button"
                              onClick={() => setSelectedCitation(sec)}
                              title={sec.excerpt}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[10px] text-neutral-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                            >
                              <BookOpen className="h-2.5 w-2.5 text-blue-500" />
                              Bagian {sec.sectionIndex}
                              {sec.title ? `: ${sec.title}` : ""}
                            </button>
                          ))}
                        </div>
                      )}

                      <span className="px-1 text-[10px] text-neutral-400">
                        {formatRelativeTime(msg.createdAt)}
                      </span>
                    </div>
                  );
                })}

                {sendMutation.isPending && (
                  <div className="flex self-start items-center gap-1 rounded-xl rounded-tl-sm border border-neutral-200 bg-white px-3 py-2.5">
                    <div className="flex gap-1">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="shrink-0 border-t border-neutral-100 bg-white p-3"
          >
            <div className="flex items-end gap-2 rounded-xl border border-neutral-200 bg-white p-1.5 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Tanya tentang dokumen ini…"
                rows={1}
                disabled={sendMutation.isPending}
                className="min-h-[34px] max-h-[110px] flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-xs text-neutral-800 shadow-none placeholder:text-neutral-400 focus-visible:ring-0"
              />
              <Button
                type="submit"
                size="icon-sm"
                disabled={!input.trim() || sendMutation.isPending}
                aria-label="Kirim pertanyaan"
                className="h-7 w-7 shrink-0 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                {sendMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </form>
        </>
      )}

      <Dialog
        open={Boolean(selectedCitation)}
        onOpenChange={(open) => {
          if (!open) setSelectedCitation(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-blue-500" />
              Bagian {selectedCitation?.sectionIndex}
              {selectedCitation?.title ? `: ${selectedCitation.title}` : ""}
            </DialogTitle>
            <DialogDescription>
              Kutipan teks dari bagian sumber dokumen.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5 text-xs leading-relaxed text-neutral-700 whitespace-pre-line">
            {selectedCitation?.excerpt ||
              "Kutipan teks tidak tersedia untuk bagian ini."}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
