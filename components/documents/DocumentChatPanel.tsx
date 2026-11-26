"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Loader2, MessageSquare, Send } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useDocumentChatQuery, useSendChatMutation } from "@/lib/query/hooks";
import { formatRelativeTime } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";

interface DocumentChatPanelProps {
  documentId: string;
  isReady: boolean;
}

const SUGGESTED_QUESTIONS = [
  "Jelaskan konsep paling penting dari dokumen ini secara sederhana.",
  "Apa saja poin utama yang perlu saya hafalkan untuk ujian?",
  "Berikan contoh penerapan praktis dari materi di dokumen ini.",
];

export function DocumentChatPanel({ documentId, isReady }: DocumentChatPanelProps) {
  const [input, setInput] = useState("");
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

  return (
    <section className="flex flex-col rounded-2xl border border-border/60 bg-background p-5 shadow-sm sm:p-6">
      <SectionHeader
        title="Tutor AI Dokumen"
        description="Tanyakan apa saja tentang isi PDF ini. Jawaban diambil langsung dari materi dokumen."
      />

      {!isReady ? (
        <div className="mt-5">
          <EmptyState
            className="min-h-[260px]"
            icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
            title="Tutor AI belum siap"
            description="Selesaikan pemrosesan dokumen terlebih dahulu agar kamu bisa berdiskusi dengan Tutor AI."
          />
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          <ScrollArea className="h-[380px] rounded-xl border border-border/60 bg-muted/15 p-4">
            {chatQuery.isLoading ? (
              <div className="flex h-full items-center justify-center py-16 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memuat percakapan...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Mulai tanya jawab tentang dokumen ini
                </p>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  Pilih salah satu pertanyaan di bawah atau tulis pertanyaanmu sendiri.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void handleSend(q)}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-blue-300 hover:text-foreground"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col gap-1.5",
                        isUser ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line",
                          isUser
                            ? "bg-blue-600 text-white"
                            : msg.status === "failed"
                              ? "border border-red-200 bg-red-50 text-red-700"
                              : "border border-border/70 bg-background text-foreground shadow-xs"
                        )}
                      >
                        {msg.content}
                      </div>

                      {!isUser && msg.sourceSections.length > 0 && (
                        <div className="flex max-w-[85%] flex-wrap gap-1.5">
                          {msg.sourceSections.map((sec) => (
                            <span
                              key={sec.id}
                              title={sec.excerpt}
                              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-2.5 py-0.5 text-[11px] text-muted-foreground"
                            >
                              <BookOpen className="h-3 w-3 text-blue-500" />
                              Bagian {sec.sectionIndex}
                              {sec.title ? `: ${sec.title}` : ""}
                            </span>
                          ))}
                        </div>
                      )}

                      <span className="px-1 text-[10px] text-muted-foreground">
                        {formatRelativeTime(msg.createdAt)}
                      </span>
                    </div>
                  );
                })}

                {sendMutation.isPending && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    Tutor AI sedang menyusun jawaban...
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </ScrollArea>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="flex items-end gap-2"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder="Tulis pertanyaan tentang isi dokumen..."
              rows={2}
              disabled={sendMutation.isPending}
              className="min-h-[56px] resize-none"
            />
            <Button
              type="submit"
              disabled={!input.trim() || sendMutation.isPending}
              className="h-11 shrink-0 bg-blue-600 px-4 text-white hover:bg-blue-700"
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      )}
    </section>
  );
}
