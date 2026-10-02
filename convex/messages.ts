import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { findOwnedProject, getOwnedProject } from "./access";
import { toMessage } from "./dtos";

const MAX_MESSAGE_LENGTH = 4_000;
const MAX_SELECTED_OPTIONS = 10;
const AI_REQUESTS_PER_HOUR = 40;
const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1000;
// An assistant reply that has been "streaming" longer than this belongs to an
// action that died; treat it as finished so it can't block the chat forever.
const STALE_STREAM_IN_MILLISECONDS = 3 * 60 * 1000;

/** The conversation of a notebook the caller owns, oldest first. */
export const listForProject = query({
  args: { projectId: v.string() },
  handler: async (ctx, { projectId }) => {
    const project = await findOwnedProject(ctx, projectId);
    if (!project) return [];
    const rows = await ctx.db
      .query("messages")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();
    return rows.map(toMessage);
  },
});

/** Appends the user's message and starts the assistant's reply. */
export const send = mutation({
  args: { projectId: v.string(), text: v.string() },
  handler: async (ctx, { projectId, text }) => {
    const project = await getOwnedProject(ctx, projectId);
    await startTurn(ctx, project, text);
  },
});

/**
 * Records the user's answer on a scoping-form card and immediately continues
 * the conversation with that answer as the next user turn.
 */
export const answerScopingForm = mutation({
  args: { messageId: v.string(), partIndex: v.number(), selected: v.array(v.string()) },
  handler: async (ctx, { messageId, partIndex, selected }) => {
    const id = ctx.db.normalizeId("messages", messageId);
    const message = id ? await ctx.db.get(id) : null;
    if (!message) throw new ConvexError("Message not found");
    const project = await getOwnedProject(ctx, message.projectId);

    const answers = selected.map((answer) => answer.trim()).filter(Boolean);
    if (answers.length === 0 || answers.length > MAX_SELECTED_OPTIONS) {
      throw new ConvexError("Pick at least one option");
    }
    const part = message.parts[partIndex];
    if (part?.type !== "tool-renderScopingForm") throw new ConvexError("Nothing to answer here");
    if (part.selected) throw new ConvexError("This question was already answered");

    const parts = [...message.parts];
    parts[partIndex] = { ...part, selected: answers };
    await ctx.db.patch(message._id, { parts });
    await startTurn(ctx, project, answers.join(", "));
  },
});

async function startTurn(ctx: MutationCtx, project: Doc<"projects">, text: string) {
  const trimmed = text.trim();
  if (!trimmed) throw new ConvexError("Write something first");
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new ConvexError(`Messages are limited to ${MAX_MESSAGE_LENGTH} characters`);
  }
  await releaseStaleStreams(ctx, project);
  await assertNotAlreadyReplying(ctx, project);
  await assertUnderRateLimit(ctx, project.ownerId);

  await ctx.db.insert("messages", {
    projectId: project._id,
    role: "user",
    parts: [{ type: "text", text: trimmed }],
  });
  const assistantMessageId = await ctx.db.insert("messages", {
    projectId: project._id,
    role: "assistant",
    parts: [],
    isStreaming: true,
  });
  await ctx.db.insert("aiRequests", { ownerId: project.ownerId });
  await ctx.db.patch(project._id, { updatedAt: Date.now() });
  await ctx.scheduler.runAfter(0, internal.ai.respond, {
    projectId: project._id,
    assistantMessageId,
  });
}

async function releaseStaleStreams(ctx: MutationCtx, project: Doc<"projects">) {
  const streaming = await streamingMessages(ctx, project);
  const cutoff = Date.now() - STALE_STREAM_IN_MILLISECONDS;
  for (const message of streaming) {
    if (message._creationTime < cutoff) await ctx.db.patch(message._id, { isStreaming: false });
  }
}

async function assertNotAlreadyReplying(ctx: MutationCtx, project: Doc<"projects">) {
  if ((await streamingMessages(ctx, project)).some((message) => message.isStreaming)) {
    throw new ConvexError("CODEPRINT is still replying — wait for it to finish");
  }
}

async function streamingMessages(ctx: MutationCtx, project: Doc<"projects">) {
  const rows = await ctx.db
    .query("messages")
    .withIndex("by_project", (q) => q.eq("projectId", project._id))
    .order("desc")
    .take(5);
  return rows.filter((message) => message.isStreaming);
}

async function assertUnderRateLimit(ctx: MutationCtx, ownerId: string) {
  const cutoff = Date.now() - ONE_HOUR_IN_MILLISECONDS;
  const recent = await ctx.db
    .query("aiRequests")
    .withIndex("by_owner", (q) => q.eq("ownerId", ownerId).gt("_creationTime", cutoff))
    .collect();
  if (recent.length >= AI_REQUESTS_PER_HOUR) {
    throw new ConvexError("You've hit the hourly message limit — try again a bit later");
  }
}
