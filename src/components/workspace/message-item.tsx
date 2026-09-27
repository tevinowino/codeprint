import { cn } from "cn";
import type { ProjectMessage } from "@/domain/types";
import { ScopingFormCard } from "@/components/generative/scoping-form-card";
import { DocumentPreviewCard } from "@/components/generative/document-preview-card";

export function MessageItem({
  message,
  onOpenDocument,
  onAnswerScopingForm,
}: {
  message: ProjectMessage;
  onOpenDocument: (docTitle: string) => void;
  onAnswerScopingForm: (partIndex: number, selected: string[]) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex flex-col gap-2", isUser && "items-end")}>
      {message.parts.map((part, index) => {
        if (part.type === "text") {
          return (
            <p
              key={index}
              className={cn(
                "max-w-[85%] text-sm leading-relaxed",
                isUser
                  ? "rounded-2xl rounded-tr-sm bg-zinc-800 px-3.5 py-2 text-zinc-100"
                  : "text-zinc-300"
              )}
            >
              {part.text}
            </p>
          );
        }

        if (part.type === "tool-renderScopingForm") {
          return (
            <ScopingFormCard
              key={index}
              part={part}
              onAnswer={(selected) => onAnswerScopingForm(index, selected)}
            />
          );
        }

        if (part.type === "tool-renderDocumentPreview") {
          return (
            <DocumentPreviewCard key={index} part={part} onOpen={onOpenDocument} />
          );
        }

        return null;
      })}
    </div>
  );
}
