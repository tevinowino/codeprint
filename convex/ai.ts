import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { isStepCount, streamText, tool } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { buildSystemPrompt, toModelMessages } from "./aiPrompt";
import { ReplyWriter } from "./replyWriter";

// Free-tier flash-lite model; override per deployment with `npx convex env set GEMINI_MODEL <id>`.
const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";
const MAX_MODEL_STEPS = 6;

type MessagePart = Doc<"messages">["parts"][number];

/**
 * Produces one assistant reply. The action is the single writer of the
 * assistant message: it streams the model's output into it (the UI is reactive,
 * so the text just appears) and executes the model's tool calls server-side.
 */
export const respond = internalAction({
  args: { projectId: v.id("projects"), assistantMessageId: v.id("messages") },
  handler: async (ctx, { projectId, assistantMessageId }) => {
    const writer = new ReplyWriter((parts, isStreaming) =>
      ctx.runMutation(internal.aiState.saveReply, {
        messageId: assistantMessageId,
        parts,
        isStreaming,
      })
    );
    try {
      await streamReply(ctx, projectId, assistantMessageId, writer);
      await writer.finish();
    } catch (error) {
      console.error("AI reply failed", error);
      await writer.fail(explainFailure(error));
    }
  },
});

async function streamReply(
  ctx: ActionCtx,
  projectId: Id<"projects">,
  assistantMessageId: Id<"messages">,
  writer: ReplyWriter
) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set on this Convex deployment");
  }
  const context = await ctx.runQuery(internal.aiState.loadContext, {
    projectId,
    assistantMessageId,
  });
  if (!context) throw new Error("Notebook no longer exists");

  const google = createGoogleGenerativeAI();
  const result = streamText({
    model: google(process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL),
    instructions: buildSystemPrompt(context.project, context.documents),
    messages: toModelMessages(context.messages),
    tools: buildTools(ctx, projectId, writer),
    stopWhen: isStepCount(MAX_MODEL_STEPS),
  });

  for await (const part of result.stream) {
    if (part.type === "text-delta") {
      await writer.appendText(part.text);
    } else if (part.type === "tool-call" && part.toolName === "renderScopingForm") {
      const { question, options } = part.input as { question: string; options: string[] };
      await writer.addPart({ type: "tool-renderScopingForm", question, options });
    } else if (part.type === "error") {
      throw part.error;
    }
  }
}

function buildTools(ctx: ActionCtx, projectId: Id<"projects">, writer: ReplyWriter) {
  return {
    // No `execute`: the model's turn ends here and the user's answer starts the next one.
    renderScopingForm: tool({
      description:
        "Show the user one scoping question as clickable option chips. Use for multiple-choice questions; ends your turn.",
      inputSchema: z.object({
        question: z.string().describe("The question, one sentence"),
        options: z.array(z.string()).min(2).max(6).describe("Short answer choices"),
      }),
    }),

    writeDocument: tool({
      description:
        "Create or fully replace a Markdown document (e.g. architecture.md). Always pass the complete document.",
      inputSchema: z.object({
        title: z.string().describe("File name, e.g. architecture.md"),
        content: z.string().describe("The full Markdown content"),
        summary: z.string().describe("One sentence describing the document, shown on its preview card"),
      }),
      execute: async ({ title, content, summary }) => {
        const version = await ctx.runMutation(internal.documents.upsert, {
          projectId,
          title,
          content,
        });
        const preview: MessagePart = {
          type: "tool-renderDocumentPreview",
          docTitle: title,
          summary,
        };
        await writer.addPart(preview);
        return `Saved ${title} (version ${version})`;
      },
    }),

    updateProjectStatus: tool({
      description: "Move the project to its next stage.",
      inputSchema: z.object({ status: z.enum(["interviewing", "architecting", "completed"]) }),
      execute: async ({ status }) => {
        await ctx.runMutation(internal.aiState.setProjectStatus, { projectId, status });
        return `Project status is now ${status}`;
      },
    }),
  };
}

function explainFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const statusCode = (error as { statusCode?: number } | null)?.statusCode;
  if (statusCode === 429 || /quota|rate.?limit|RESOURCE_EXHAUSTED/i.test(message)) {
    return "The free Gemini quota is used up for the moment. Give it a minute and send that again.";
  }
  if (/API_KEY|api key/i.test(message)) {
    return "The AI service isn't configured yet (missing Gemini API key).";
  }
  return "Something went wrong while writing that reply. Try sending it again.";
}
