import "server-only";

import { mockDocuments, mockMessages, mockProjects } from "@/lib/mock-data";
import type { Project, ProjectDocument, ProjectMessage } from "@/domain/types";

// Read API the UI depends on. Backed by static mock data today; a later phase
// swaps these implementations for Convex queries without touching any caller.

export async function listProjects(): Promise<Project[]> {
  return [...mockProjects].sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProject(id: string): Promise<Project | null> {
  return mockProjects.find((project) => project.id === id) ?? null;
}

export async function getMessages(projectId: string): Promise<ProjectMessage[]> {
  return mockMessages[projectId] ?? [];
}

export async function getDocuments(projectId: string): Promise<ProjectDocument[]> {
  return mockDocuments[projectId] ?? [];
}
