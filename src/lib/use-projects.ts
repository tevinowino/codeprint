"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useReportedMutation } from "@/lib/convex-errors";

/** All of the signed-in user's notebooks, or undefined while loading. */
export function useProjects() {
  return useQuery(api.projects.list);
}

/** One notebook: undefined while loading, null when it doesn't exist or isn't theirs. */
export function useProject(projectId: string) {
  return useQuery(api.projects.get, { projectId });
}

/** Resolves to the new notebook's id, or undefined if creation failed (a toast explains why). */
export function useCreateProject() {
  return useReportedMutation(api.projects.create);
}
