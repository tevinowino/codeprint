import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { findOwnedProject } from "./access";
import { toDocument } from "./dtos";

/** Documents of a notebook the caller owns, oldest first (stable tab order). */
export const listForProject = query({
  args: { projectId: v.string() },
  handler: async (ctx, { projectId }) => {
    const project = await findOwnedProject(ctx, projectId);
    if (!project) return [];
    const rows = await ctx.db
      .query("documents")
      .withIndex("by_project_and_title", (q) => q.eq("projectId", project._id))
      .collect();
    return rows.sort((a, b) => a._creationTime - b._creationTime).map(toDocument);
  },
});

/**
 * Creates the document, or replaces its content and bumps `version` when one
 * with this title already exists. Internal: only the AI action writes documents.
 */
export const upsert = internalMutation({
  args: { projectId: v.id("projects"), title: v.string(), content: v.string() },
  handler: async (ctx, { projectId, title, content }) => {
    const existing = await ctx.db
      .query("documents")
      .withIndex("by_project_and_title", (q) =>
        q.eq("projectId", projectId).eq("title", title)
      )
      .unique();
    const now = Date.now();
    await ctx.db.patch(projectId, { updatedAt: now });
    if (existing) {
      await ctx.db.patch(existing._id, { content, version: existing.version + 1, updatedAt: now });
      return existing.version + 1;
    }
    await ctx.db.insert("documents", { projectId, title, content, version: 1, updatedAt: now });
    return 1;
  },
});
