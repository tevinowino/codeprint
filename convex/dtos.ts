import type { Doc } from "./_generated/dataModel";

// Convex rows -> the shapes in src/domain/types.ts. The UI never sees `_id` or
// `_creationTime`; this file is the only place that translation happens.

export const toProject = (row: Doc<"projects">) => ({
  id: row._id as string,
  title: row.title,
  description: row.description,
  status: row.status,
  createdAt: row._creationTime,
  updatedAt: row.updatedAt,
});

export const toMessage = (row: Doc<"messages">) => ({
  id: row._id as string,
  projectId: row.projectId as string,
  role: row.role,
  parts: row.parts,
  isStreaming: row.isStreaming ?? false,
  createdAt: row._creationTime,
});

export const toDocument = (row: Doc<"documents">) => ({
  id: row._id as string,
  projectId: row.projectId as string,
  title: row.title,
  content: row.content,
  version: row.version,
  updatedAt: row.updatedAt,
});

export const toTrackerItem = (row: Doc<"trackerItems">) => ({
  id: row._id as string,
  projectId: row.projectId as string,
  title: row.title,
  completed: row.completed,
  status: row.status,
  createdAt: row._creationTime,
});

export const toNote = (row: Doc<"notes">) => ({
  id: row._id as string,
  projectId: row.projectId as string,
  content: row.content,
  createdAt: row._creationTime,
  updatedAt: row.updatedAt,
});
