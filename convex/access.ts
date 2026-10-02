import { ConvexError } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

/** The signed-in user's Clerk id, or a ConvexError if the caller is anonymous. */
export async function requireOwnerId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Not signed in");
  return identity.subject;
}

/**
 * Loads a project the caller owns. Returns null for malformed ids, missing
 * projects, and projects owned by someone else — deliberately indistinguishable
 * so ids can't be probed for existence.
 */
export async function findOwnedProject(
  ctx: QueryCtx | MutationCtx,
  projectId: string
): Promise<Doc<"projects"> | null> {
  const ownerId = await requireOwnerId(ctx);
  const id = ctx.db.normalizeId("projects", projectId);
  if (!id) return null;
  const project = await ctx.db.get(id);
  return project && project.ownerId === ownerId ? project : null;
}

/** Like findOwnedProject, but throws — for mutations that cannot proceed without it. */
export async function getOwnedProject(
  ctx: QueryCtx | MutationCtx,
  projectId: string
): Promise<Doc<"projects">> {
  const project = await findOwnedProject(ctx, projectId);
  if (!project) throw new ConvexError("Notebook not found");
  return project;
}

/** Bumps `projects.updatedAt` so the dashboard's "recently active" ordering stays honest. */
export async function touchProject(ctx: MutationCtx, project: Doc<"projects">) {
  await ctx.db.patch(project._id, { updatedAt: Date.now() });
}
