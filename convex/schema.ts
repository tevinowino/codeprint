import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  messagePartValidator,
  messageRoleValidator,
  projectStatusValidator,
  trackerStatusValidator,
} from "./validators";

/**
 * Ownership boundary: `projects.ownerId` (the Clerk user id, `identity.subject`).
 * Every other table hangs off a project and is reached only through
 * `getOwnedProject` in ./access.ts — Convex does not enforce that for us.
 * `updatedAt` exists only where rows are edited in place; elsewhere
 * `_creationTime` is the creation timestamp.
 */
export default defineSchema({
  projects: defineTable({
    ownerId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    status: projectStatusValidator,
    updatedAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  messages: defineTable({
    projectId: v.id("projects"),
    role: messageRoleValidator,
    parts: v.array(messagePartValidator),
    /** True while the AI action is still streaming into this assistant message. */
    isStreaming: v.optional(v.boolean()),
  }).index("by_project", ["projectId"]),

  documents: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    content: v.string(),
    version: v.number(),
    updatedAt: v.number(),
  }).index("by_project_and_title", ["projectId", "title"]),

  trackerItems: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    completed: v.boolean(),
    status: trackerStatusValidator,
  }).index("by_project", ["projectId"]),

  notes: defineTable({
    projectId: v.id("projects"),
    content: v.string(),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),

  /** One row per AI request, used for per-user rate limiting. */
  aiRequests: defineTable({
    ownerId: v.string(),
  }).index("by_owner", ["ownerId"]),
});
