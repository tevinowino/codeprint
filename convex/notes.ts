import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { findOwnedProject, getOwnedProject, requireOwnerId } from "./access";
import { toNote } from "./dtos";

const MAX_CONTENT_LENGTH = 10_000;

/** Notes of a notebook the caller owns, most recently edited first. */
export const listForProject = query({
  args: { projectId: v.string() },
  handler: async (ctx, { projectId }) => {
    const project = await findOwnedProject(ctx, projectId);
    if (!project) return [];
    const rows = await ctx.db
      .query("notes")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();
    return rows.map(toNote).sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const create = mutation({
  args: { projectId: v.string(), content: v.string() },
  handler: async (ctx, { projectId, content }) => {
    const project = await getOwnedProject(ctx, projectId);
    await ctx.db.insert("notes", {
      projectId: project._id,
      content: validNoteContent(content),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: { noteId: v.string(), content: v.string() },
  handler: async (ctx, { noteId, content }) => {
    const note = await requireOwnedNote(ctx, noteId);
    await ctx.db.patch(note._id, { content: validNoteContent(content), updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { noteId: v.string() },
  handler: async (ctx, { noteId }) => {
    const note = await requireOwnedNote(ctx, noteId);
    await ctx.db.delete(note._id);
  },
});

function validNoteContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) throw new ConvexError("A note can't be empty");
  if (trimmed.length > MAX_CONTENT_LENGTH) {
    throw new ConvexError(`Notes are limited to ${MAX_CONTENT_LENGTH} characters`);
  }
  return trimmed;
}

async function requireOwnedNote(ctx: MutationCtx, noteId: string) {
  const ownerId = await requireOwnerId(ctx);
  const id = ctx.db.normalizeId("notes", noteId);
  const note = id ? await ctx.db.get(id) : null;
  const project = note ? await ctx.db.get(note.projectId) : null;
  if (!note || project?.ownerId !== ownerId) throw new ConvexError("Note not found");
  return note;
}
