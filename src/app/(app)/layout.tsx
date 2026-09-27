import { listProjects } from "@/lib/projects";
import { Sidebar } from "@/components/shell/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const projects = await listProjects();

  return (
    <div className="flex h-dvh w-full flex-col md:flex-row">
      <Sidebar projects={projects} />
      {/*
       * h-full (not min-h-full) + overflow-y-auto makes this the page-level
       * scroll container: routes that fill it exactly (Workspace, via its own
       * h-full/min-h-0 chain down to internal scroll regions) never trigger
       * it, while routes with natural content taller than the viewport
       * (Dashboard) scroll here instead of growing the whole document.
       */}
      <div className="h-full min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
