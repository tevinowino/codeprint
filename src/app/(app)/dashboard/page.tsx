import { listProjects } from "@/lib/projects";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const projects = await listProjects();
  return <DashboardView projects={projects} />;
}
