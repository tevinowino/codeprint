import { cn } from "cn";
import type { ProjectStatus } from "@/domain/types";

// Single source of truth for how a ProjectStatus is labeled and colored.
// Every surface that shows status (sidebar, dashboard cards, workspace
// stepper) reads from this map instead of re-deriving labels/colors.
export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; dotClassName: string }
> = {
  interviewing: { label: "Interviewing", dotClassName: "bg-zinc-400" },
  architecting: { label: "Architecting", dotClassName: "bg-zinc-900 dark:bg-zinc-100" },
  completed: { label: "Completed", dotClassName: "bg-primary" },
};

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  "interviewing",
  "architecting",
  "completed",
];

export function StatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const meta = PROJECT_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground",
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dotClassName)} />
      {meta.label}
    </span>
  );
}
