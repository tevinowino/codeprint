import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { messagePartValidator, projectStatusValidator } from "./validators";

// Database access for the AI action in ./ai.ts. Actions cannot touch the
// database directly, so everything it reads or writes goes through these.

/** Everything the model needs: the project, its transcript (minus the placeholder being filled), and its documents. */
export const loadContext = internalQuery({
  args: { projectId: v.id("projects"), assistantMessageId: v.id("messages") },
  handler: async (ctx, { projectId, assistantMessageId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) return null;
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_project_and_title", (q) => q.eq("projectId", projectId))
      .collect();
    return {
      project,
      messages: messages.filter((message) => message._id !== assistantMessageId),
      documents,
    };
  },
});

/** Replaces the assistant message's parts while it streams, and marks it finished when `isStreaming` is false. */
export const saveReply = internalMutation({
  args: {
    messageId: v.id("messages"),
    parts: v.array(messagePartValidator),
    isStreaming: v.boolean(),
  },
  handler: async (ctx, { messageId, parts, isStreaming }) => {
    await ctx.db.patch(messageId, { parts, isStreaming });
  },
});

export const setProjectStatus = internalMutation({
  args: { projectId: v.id("projects"), status: projectStatusValidator },
  handler: async (ctx, { projectId, status }) => {
    await ctx.db.patch(projectId, { status, updatedAt: Date.now() });
  },
});
