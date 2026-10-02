import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import type { Project } from "@/domain/types";
import { StatusBadge } from "@/components/status-badge";
import { formatRelativeTime } from "@/lib/format";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/project/${project.id}`}
      className="group flex flex-col justify-between gap-6 rounded-xl border-2 border-zinc-900 bg-card p-5 transition-colors hover:bg-muted dark:border-zinc-100"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{project.title}</h3>
        <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">
        {project.description ?? "No description yet."}
      </p>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <StatusBadge status={project.status} />
        <span className="text-xs text-muted-foreground">
          Updated {formatRelativeTime(project.updatedAt)}
        </span>
      </div>
    </Link>
  );
}
