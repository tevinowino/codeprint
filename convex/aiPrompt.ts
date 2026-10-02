import type { Doc } from "./_generated/dataModel";

/**
 * Pure prompt-building for the assistant: no database or network access, so it
 * can be tested directly. The Convex action in ./ai.ts feeds it loaded rows.
 */

export type ModelMessage = { role: "user" | "assistant"; content: string };

const STAGE_GUIDANCE: Record<Doc<"projects">["status"], string> = {
  interviewing:
    "The project is in the INTERVIEW stage. Ask focused questions to learn the core user loop, target users, key features, data, integrations, and constraints. Ask ONE question at a time; when the answer is a choice between a few options, use the renderScopingForm tool instead of a plain-text question. Once you understand enough to draft real documents, call updateProjectStatus with 'architecting' and begin writing documents.",
  architecting:
    "The project is in the ARCHITECTING stage. Write the documents with writeDocument: architecture.md (system design and tech choices), design.md (UX and screens), schema.md (data model), README.md (overview and setup). Write one document per tool call. When all four exist and the user has no open questions, call updateProjectStatus with 'completed'.",
  completed:
    "The project is COMPLETED: its documents exist. When the user asks for a change (e.g. swap a database), update every affected document by calling writeDocument again with the same title and the FULL revised content, then briefly say what changed. Do not change the status.",
};

export function buildSystemPrompt(
  project: Pick<Doc<"projects">, "title" | "description" | "status">,
  documents: Pick<Doc<"documents">, "title" | "content" | "version">[]
): string {
  const existingDocuments = documents.length
    ? documents
        .map((doc) => `--- ${doc.title} (v${doc.version}) ---\n${doc.content}`)
        .join("\n\n")
    : "(none yet)";

  return [
    "You are CODEPRINT, an elite software architect. You help a builder scope a software project BEFORE any code is written, then turn the conversation into precise design documents.",
    "Be concise, concrete and opinionated: recommend a specific choice and say why, rather than listing every option. Use plain text in chat; documents are Markdown.",
    `Project: ${project.title}${project.description ? ` — ${project.description}` : ""}`,
    STAGE_GUIDANCE[project.status],
    "Tools: renderScopingForm shows the user a set of option chips (it ends your turn so they can answer). writeDocument saves a complete Markdown document (always send the whole document, never a diff). updateProjectStatus moves the stage forward.",
    `Existing documents:\n${existingDocuments}`,
  ].join("\n\n");
}

/**
 * Flattens stored messages into plain chat turns. Tool cards become short
 * bracketed notes so the model remembers what it asked and produced without
 * needing replayable tool-call history.
 */
export function toModelMessages(
  messages: Pick<Doc<"messages">, "role" | "parts">[]
): ModelMessage[] {
  const turns: ModelMessage[] = [];
  for (const message of messages) {
    if (message.role === "system") continue;
    const content = message.parts
      .map((part) => {
        if (part.type === "text") return part.text;
        if (part.type === "tool-renderScopingForm") {
          const answer = part.selected ? ` User answered: ${part.selected.join(", ")}.` : "";
          return `[Asked the user: "${part.question}" with options: ${part.options.join(" / ")}.${answer}]`;
        }
        return `[Saved document ${part.docTitle}: ${part.summary}]`;
      })
      .join("\n")
      .trim();
    if (!content) continue;

    const previous = turns[turns.length - 1];
    if (previous?.role === message.role) previous.content += `\n${content}`;
    else turns.push({ role: message.role, content });
  }
  return turns;
}
