"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectMessage } from "@/domain/types";
import { MessageItem } from "@/components/workspace/message-item";
import { Composer } from "@/components/workspace/composer";

export function ChatPanel({
  projectId,
  initialMessages,
  onOpenDocument,
}: {
  projectId: string;
  initialMessages: ProjectMessage[];
  onOpenDocument: (docTitle: string) => void;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  function handleSend(text: string) {
    setMessages((current) => [
      ...current,
      {
        id: `local_${Date.now()}`,
        projectId,
        role: "user",
        parts: [{ type: "text", text }],
        createdAt: Date.now(),
      },
    ]);
  }

  function handleAnswerScopingForm(messageId: string, partIndex: number, selected: string[]) {
    setMessages((current) =>
      current.map((message) => {
        if (message.id !== messageId) return message;
        const parts = [...message.parts];
        const part = parts[partIndex];
        if (part?.type !== "tool-renderScopingForm") return message;
        parts[partIndex] = { ...part, selected };
        return { ...message, parts };
      })
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-5">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onOpenDocument={onOpenDocument}
              onAnswerScopingForm={(partIndex, selected) =>
                handleAnswerScopingForm(message.id, partIndex, selected)
              }
            />
          ))}
          <div ref={scrollAnchorRef} />
        </div>
      </div>
      <Composer onSend={handleSend} />
    </div>
  );
}
