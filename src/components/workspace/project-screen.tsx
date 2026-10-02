"use client";

import Link from "next/link";
import { useProject } from "@/lib/use-projects";
import { Workspace } from "@/components/workspace/workspace";

/**
 * Resolves the notebook for a `/project/[id]` URL. A missing notebook and one
 * owned by someone else look identical on purpose (see convex/access.ts).
 */
export function ProjectScreen({ projectId }: { projectId: string }) {
  const project = useProject(projectId);

  if (project === undefined) {
    return <p className="px-6 py-8 text-sm text-muted-foreground">Loading notebook…</p>;
  }
  if (project === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-muted-foreground">
          This notebook doesn&apos;t exist, or it isn&apos;t yours.
        </p>
        <Link href="/dashboard" className="text-sm underline underline-offset-4">
          Back to notebooks
        </Link>
      </div>
    );
  }
  return <Workspace project={project} />;
}
