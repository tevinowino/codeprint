"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useReportedMutation } from "@/lib/convex-errors";
import type { ProjectMessage } from "@/domain/types";

/** What ChatPanel needs; `messages` is undefined until the first server response. */
export interface ChatController {
  messages: ProjectMessage[] | undefined;
  /** True while the assistant is still writing its reply. */
  isResponding: boolean;
  sendMessage: (text: string) => void;
  answerScopingForm: (messageId: string, partIndex: number, selected: string[]) => void;
}

/**
 * A notebook's conversation, live from Convex. The assistant's reply streams
 * into the message list on its own; sending just enqueues the user's turn.
 */
export function useProjectChat(projectId: string): ChatController {
  const messages = useQuery(api.messages.listForProject, { projectId });
  const send = useReportedMutation(api.messages.send);
  const answer = useReportedMutation(api.messages.answerScopingForm);

  return {
    messages,
    isResponding: messages?.some((message) => message.isStreaming) ?? false,
    sendMessage: (text) => void send({ projectId, text }),
    answerScopingForm: (messageId, partIndex, selected) =>
      void answer({ messageId, partIndex, selected }),
  };
}
