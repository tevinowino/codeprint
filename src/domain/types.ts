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
