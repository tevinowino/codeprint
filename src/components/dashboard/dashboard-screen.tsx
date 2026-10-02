"use client";

import { useProjects } from "@/lib/use-projects";
import { DashboardView } from "@/components/dashboard/dashboard-view";

/** Loads the signed-in user's notebooks and hands them to the presentational view. */
export function DashboardScreen() {
  const projects = useProjects();

  if (projects === undefined) {
    return (
      <p className="px-6 py-8 text-sm text-muted-foreground">Loading notebooks…</p>
    );
  }
  return <DashboardView projects={projects} />;
}
