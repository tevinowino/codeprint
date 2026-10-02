import { z } from "zod";

// Mirrors the Convex schema in the project blueprint. This module is the seam:
// swapping the mock data layer for real Convex queries later should require no
// changes to these shapes, only to lib/projects.ts.

export type ProjectStatus = "interviewing" | "architecting" | "completed";

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;
}

export type MessageRole = "user" | "assistant" | "system";

export interface TextPart {
  type: "text";
  text: string;
}

export interface ScopingFormPart {
  type: "tool-renderScopingForm";
  question: string;
  options: string[];
  /** Present once the user has responded; absent while the card is awaiting input. */
  selected?: string[];
}

export interface DocumentPreviewPart {
  type: "tool-renderDocumentPreview";
  docTitle: string;
  summary: string;
}

export type MessagePart = TextPart | ScopingFormPart | DocumentPreviewPart;

export interface ProjectMessage {
  id: string;
  projectId: string;
  role: MessageRole;
  parts: MessagePart[];
  /** True while the assistant is still writing this message. */
  isStreaming?: boolean;
  createdAt: number;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  title: string; // e.g. "architecture.md"
  content: string;
  version: number;
  updatedAt: number;
}

export const TrackerItemStatusSchema = z.enum([
  "todo",
  "in_progress",
  "almost_completed",
  "completed",
  "on_hold",
]);

export type TrackerItemStatus = z.infer<typeof TrackerItemStatusSchema>;

export const TrackerItemSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string().min(1),
  completed: z.boolean(),
  status: TrackerItemStatusSchema.default("todo"),
  createdAt: z.number(),
});

export interface TrackerItem {
  id: string;
  projectId: string;
  title: string;
  completed: boolean;
  status?: TrackerItemStatus;
  createdAt: number;
}

export function resolveTrackerStatus(
  status?: TrackerItemStatus,
  completed?: boolean
): TrackerItemStatus {
  if (status) return status;
  if (completed) return "completed";
  return "todo";
}

export interface NotebookNote {
  id: string;
  projectId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}
