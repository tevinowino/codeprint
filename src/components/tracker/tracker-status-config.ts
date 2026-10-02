import type { TrackerItemStatus } from "@/domain/types";
import {
  Circle,
  Clock,
  Sparkles,
  CheckCircle2,
  PauseCircle,
  type LucideIcon,
} from "lucide-react";

export interface StatusMeta {
  value: TrackerItemStatus;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  progressPercent: number;
  badgeClass: string;
  colorClass: string;
  barColor: string;
  description: string;
}

export const STATUS_CONFIG: Record<TrackerItemStatus, StatusMeta> = {
  todo: {
    value: "todo",
    label: "To Do",
    shortLabel: "To Do",
    icon: Circle,
    progressPercent: 0,
    badgeClass: "bg-muted/70 text-muted-foreground border-border hover:bg-muted",
    colorClass: "text-muted-foreground",
    barColor: "bg-muted-foreground/30",
    description: "Not started yet",
  },
  in_progress: {
    value: "in_progress",
    label: "In Progress",
    shortLabel: "In Prog",
    icon: Clock,
    progressPercent: 50,
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 hover:bg-sky-500/20",
    colorClass: "text-sky-600 dark:text-sky-400",
    barColor: "bg-sky-500",
    description: "Actively being worked on",
  },
  almost_completed: {
    value: "almost_completed",
    label: "Almost Completed",
    shortLabel: "Almost Done",
    icon: Sparkles,
    progressPercent: 85,
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20",
    colorClass: "text-amber-600 dark:text-amber-400",
    barColor: "bg-amber-500",
    description: "Nearly finished / in review",
  },
  completed: {
    value: "completed",
    label: "Completed",
    shortLabel: "Done",
    icon: CheckCircle2,
    progressPercent: 100,
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    barColor: "bg-emerald-500",
    description: "Done and verified",
  },
  on_hold: {
    value: "on_hold",
    label: "On Hold",
    shortLabel: "Hold",
    icon: PauseCircle,
    progressPercent: 0,
    badgeClass: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/25 hover:bg-zinc-500/20",
    colorClass: "text-zinc-500 dark:text-zinc-400",
    barColor: "bg-zinc-400",
    description: "Paused or blocked",
  },
};

export const STATUS_OPTIONS: StatusMeta[] = [
  STATUS_CONFIG.todo,
  STATUS_CONFIG.in_progress,
  STATUS_CONFIG.almost_completed,
  STATUS_CONFIG.completed,
  STATUS_CONFIG.on_hold,
];
