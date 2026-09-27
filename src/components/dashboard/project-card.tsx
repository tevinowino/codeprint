import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import type { Project } from "@/domain/types";
import { StatusBadge } from "@/components/status-badge";
import { formatRelativeTime } from "@/lib/format";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/project/${project.id}`}
      className="group flex flex-col justify-between gap-6 rounded-xl border border-zinc-800 bg-zinc-900/55 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-100">{project.title}</h3>
        <ArrowUpRightIcon className="size-4 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-300" />
      </div>

      <p className="line-clamp-2 text-sm text-zinc-500">
        {project.description ?? "No description yet."}
      </p>

      <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
        <StatusBadge status={project.status} />
        <span className="text-xs text-zinc-600">
          Updated {formatRelativeTime(project.updatedAt)}
        </span>
      </div>
    </Link>
  );
}
