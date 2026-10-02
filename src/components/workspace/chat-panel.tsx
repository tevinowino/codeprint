"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { ThinkingOrb } from "thinking-orbs";
import type { ProjectMessage } from "@/domain/types";
import type { ChatController } from "@/lib/use-project-chat";
import { MessageItem } from "@/components/workspace/message-item";
import { Composer } from "@/components/workspace/composer";

// Stable identity, so the scroll effect below doesn't re-run on every render while loading.
const NO_MESSAGES: ProjectMessage[] = [];

export function ChatPanel({
  messages: loadedMessages,
  isResponding,
  sendMessage,
  answerScopingForm,
  onOpenDocument,
}: ChatController & { onOpenDocument: (docTitle: string) => void }) {
  const { resolvedTheme } = useTheme();
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const messages = loadedMessages ?? NO_MESSAGES;
  // The assistant's placeholder exists (empty) before its first token arrives;
  // the orb stands in for it until there is something to show.
  const visibleMessages = messages.filter((message) => message.parts.length > 0);
  const isWaitingForFirstToken =
    isResponding && messages.at(-1)?.role === "assistant" && messages.at(-1)?.parts.length === 0;

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-5">
          {loadedMessages !== undefined && visibleMessages.length === 0 && !isResponding && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Describe what you want to build and CODEPRINT will start scoping it with you.
            </p>
          )}
          {visibleMessages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onOpenDocument={onOpenDocument}
              onAnswerScopingForm={(partIndex, selected) =>
                answerScopingForm(message.id, partIndex, selected)
              }
            />
          ))}
          {isWaitingForFirstToken && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ThinkingOrb
                state="breathing"
                size={20}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                aria-hidden="true"
              />
              <span>Thinking…</span>
            </div>
          )}
          <div ref={scrollAnchorRef} />
        </div>
      </div>
      <Composer onSend={sendMessage} disabled={isResponding} />
    </div>
  );
}
