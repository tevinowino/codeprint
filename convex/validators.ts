import { v } from "convex/values";

// Mirrors the string unions in src/domain/types.ts. Keep the two in sync:
// the domain types are what the UI compiles against, these are what the
// database accepts.

export const projectStatusValidator = v.union(
  v.literal("interviewing"),
  v.literal("architecting"),
  v.literal("completed")
);

export const trackerStatusValidator = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("almost_completed"),
  v.literal("completed"),
  v.literal("on_hold")
);

export const messageRoleValidator = v.union(
  v.literal("user"),
  v.literal("assistant"),
  v.literal("system")
);

export const messagePartValidator = v.union(
  v.object({ type: v.literal("text"), text: v.string() }),
  v.object({
    type: v.literal("tool-renderScopingForm"),
    question: v.string(),
    options: v.array(v.string()),
    selected: v.optional(v.array(v.string())),
  }),
  v.object({
    type: v.literal("tool-renderDocumentPreview"),
    docTitle: v.string(),
    summary: v.string(),
  })
);
