import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { findOwnedProject, requireOwnerId } from "./access";
import { toProject } from "./dtos";
import { projectStatusValidator } from "./validators";

const MAX_TITLE_LENGTH = 120;

/** The caller's notebooks, most recently active first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await requireOwnerId(ctx);
    const rows = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .collect();
    return rows.map(toProject).sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

/** One notebook, or null when the id is unknown or belongs to someone else. */
export const get = query({
  args: { projectId: v.string() },
  handler: async (ctx, { projectId }) => {
    const project = await findOwnedProject(ctx, projectId);
    return project ? toProject(project) : null;
  },
});

/** Creates a notebook in the `interviewing` stage and returns its id. */
export const create = mutation({
  args: { title: v.string(), description: v.optional(v.string()) },
  handler: async (ctx, { title, description }) => {
    const ownerId = await requireOwnerId(ctx);
    const trimmedTitle = title.trim();
    if (!trimmedTitle) throw new ConvexError("A notebook needs a title");
    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      throw new ConvexError(`Titles are limited to ${MAX_TITLE_LENGTH} characters`);
    }
    const id = await ctx.db.insert("projects", {
      ownerId,
      title: trimmedTitle,
      description: description?.trim() || undefined,
      status: "interviewing",
      updatedAt: Date.now(),
    });
    return id as string;
  },
});

/** Manual override of the interviewing → architecting → completed stage. */
export const updateStatus = mutation({
  args: { projectId: v.string(), status: projectStatusValidator },
  handler: async (ctx, { projectId, status }) => {
    const project = await findOwnedProject(ctx, projectId);
    if (!project) throw new ConvexError("Notebook not found");
    await ctx.db.patch(project._id, { status, updatedAt: Date.now() });
  },
});
