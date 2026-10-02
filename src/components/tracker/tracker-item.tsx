"use client";

import { XIcon, ChevronDownIcon, CheckIcon } from "lucide-react";
import { cn } from "cn";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TrackerItem as TrackerItemType, TrackerItemStatus } from "@/domain/types";
import { resolveTrackerStatus } from "@/domain/types";
import { STATUS_CONFIG, STATUS_OPTIONS } from "@/components/tracker/tracker-status-config";

export function TrackerItem({
  item,
  onToggle,
  onStatusChange,
  onRemove,
}: {
  item: TrackerItemType;
  onToggle: (id: string) => void;
  onStatusChange?: (id: string, status: TrackerItemStatus) => void;
  onRemove: (id: string) => void;
}) {
  const currentStatus = resolveTrackerStatus(item.status, item.completed);
  const config = STATUS_CONFIG[currentStatus];
  const StatusIcon = config.icon;
  const isCompleted = currentStatus === "completed";

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 transition-colors hover:border-border/60 hover:bg-muted/50">
      <Checkbox
        checked={isCompleted}
        onCheckedChange={() => onToggle(item.id)}
        aria-label={
          isCompleted
            ? `Mark "${item.title}" incomplete`
            : `Mark "${item.title}" complete`
        }
      />

      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <span
          className={cn(
            "truncate text-sm transition-colors",
            isCompleted
              ? "text-muted-foreground line-through"
              : "font-normal text-foreground"
          )}
        >
          {item.title}
        </span>

        {/* Task-level inline In-Progress Bar */}
        {(currentStatus === "in_progress" || currentStatus === "almost_completed") && (
          <div className="mt-1 flex items-center gap-2">
            <div
              className="h-1.5 w-20 overflow-hidden rounded-full bg-muted border border-border/40"
              role="progressbar"
              aria-label={`Task progress: ${config.progressPercent}%`}
              aria-valuenow={config.progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={cn("h-full transition-all duration-300", config.barColor)}
                style={{ width: `${config.progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">
              {config.progressPercent}%
            </span>
          </div>
        )}
      </div>

      {/* Status Selector Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "group/status inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer select-none",
            config.badgeClass
          )}
          aria-label={`Change status for "${item.title}". Current status: ${config.label}`}
        >
          <StatusIcon className="size-3 shrink-0" />
          <span className="hidden sm:inline">{config.label}</span>
          <span className="sm:hidden">{config.shortLabel}</span>
          <ChevronDownIcon className="size-3 opacity-60 transition-transform group-hover/status:opacity-100" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 p-1.5">
          <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
            Status
          </DropdownMenuLabel>
          {STATUS_OPTIONS.map((opt) => {
            const OptIcon = opt.icon;
            const isSelected = opt.value === currentStatus;
            return (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => onStatusChange?.(item.id, opt.value)}
                className={cn(
                  "flex items-center justify-between rounded-md px-2 py-1.5 text-xs cursor-pointer",
                  isSelected && "bg-accent/80 font-medium"
                )}
              >
                <div className="flex items-center gap-2">
                  <OptIcon className={cn("size-3.5", opt.colorClass)} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <CheckIcon className="size-3.5 text-foreground ml-2" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-muted-foreground opacity-60 hover:text-foreground group-hover:opacity-100"
        onClick={() => onRemove(item.id)}
      >
        <XIcon className="size-3.5" />
        <span className="sr-only">Delete task</span>
      </Button>
    </div>
  );
}
