import { notFound } from "next/navigation";
import { getDocuments, getMessages, getProject } from "@/lib/projects";
import { Workspace } from "@/components/workspace/workspace";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const [messages, documents] = await Promise.all([
    getMessages(id),
    getDocuments(id),
  ]);

  return (
    <Workspace project={project} initialMessages={messages} documents={documents} />
  );
}
