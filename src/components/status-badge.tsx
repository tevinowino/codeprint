import { cn } from "cn";
import type { ProjectStatus } from "@/domain/types";

// Single source of truth for how a ProjectStatus is labeled and colored.
// Every surface that shows status (sidebar, dashboard cards, workspace
// stepper) reads from this map instead of re-deriving labels/colors.
export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; dotClassName: string }
> = {
  interviewing: { label: "Interviewing", dotClassName: "bg-amber-400" },
  architecting: { label: "Architecting", dotClassName: "bg-sky-400" },
  completed: { label: "Completed", dotClassName: "bg-emerald-400" },
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
        "inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400",
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dotClassName)} />
      {meta.label}
    </span>
  );
}
