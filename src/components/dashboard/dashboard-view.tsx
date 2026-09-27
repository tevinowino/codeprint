"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import type { Project } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { NewProjectDialog } from "@/components/dashboard/new-project-dialog";

export function DashboardView({ projects }: { projects: Project[] }) {
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Notebooks</h1>
          <p className="text-sm text-zinc-500">
            Every project you&apos;re scoping, in one place.
          </p>
        </div>
        <Button onClick={() => setNewProjectOpen(true)} className="gap-1.5">
          <PlusIcon className="size-4" />
          New notebook
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState onCreateClick={() => setNewProjectOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <NewProjectDialog open={newProjectOpen} onOpenChange={setNewProjectOpen} />
    </div>
  );
}
