import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { findOwnedProject, getOwnedProject, requireOwnerId } from "./access";
import { toTrackerItem } from "./dtos";
import { trackerStatusValidator } from "./validators";

const MAX_TITLE_LENGTH = 300;

/** Tasks of a notebook the caller owns, oldest first. */
export const listForProject = query({
  args: { projectId: v.string() },
  handler: async (ctx, { projectId }) => {
    const project = await findOwnedProject(ctx, projectId);
    if (!project) return [];
    const rows = await ctx.db
      .query("trackerItems")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();
    return rows.map(toTrackerItem);
  },
});

export const create = mutation({
  args: {
    projectId: v.string(),
    title: v.string(),
    status: v.optional(trackerStatusValidator),
  },
  handler: async (ctx, { projectId, title, status = "todo" }) => {
    const project = await getOwnedProject(ctx, projectId);
    const trimmed = title.trim();
    if (!trimmed) throw new ConvexError("A task needs a title");
    if (trimmed.length > MAX_TITLE_LENGTH) {
      throw new ConvexError(`Tasks are limited to ${MAX_TITLE_LENGTH} characters`);
    }
    await ctx.db.insert("trackerItems", {
      projectId: project._id,
      title: trimmed,
      status,
      completed: status === "completed",
    });
  },
});

/** Sets the status; `completed` is derived from it so the two never disagree. */
export const setStatus = mutation({
  args: { itemId: v.string(), status: trackerStatusValidator },
  handler: async (ctx, { itemId, status }) => {
    const item = await requireOwnedItem(ctx, itemId);
    await ctx.db.patch(item._id, { status, completed: status === "completed" });
  },
});

export const remove = mutation({
  args: { itemId: v.string() },
  handler: async (ctx, { itemId }) => {
    const item = await requireOwnedItem(ctx, itemId);
    await ctx.db.delete(item._id);
  },
});

async function requireOwnedItem(ctx: MutationCtx, itemId: string) {
  const ownerId = await requireOwnerId(ctx);
  const id = ctx.db.normalizeId("trackerItems", itemId);
  const item = id ? await ctx.db.get(id) : null;
  const project = item ? await ctx.db.get(item.projectId) : null;
  if (!item || project?.ownerId !== ownerId) throw new ConvexError("Task not found");
  return item;
}
