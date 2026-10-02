import { ProjectScreen } from "@/components/workspace/project-screen";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectScreen projectId={id} />;
}
