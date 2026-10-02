"use client";

import { useState } from "react";
import {
  ListTodoIcon,
  PlusIcon,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  PauseCircle,
  FilterX,
} from "lucide-react";
import type { TrackerController } from "@/lib/use-tracker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrackerItem } from "@/components/tracker/tracker-item";
import type { TrackerItemStatus } from "@/domain/types";
import { resolveTrackerStatus } from "@/domain/types";
import { cn } from "cn";

export function TrackerPanel({
  items: loadedItems,
  addItem,
  setItemStatus,
  toggleItem,
  removeItem,
}: TrackerController) {
  const items = loadedItems ?? [];
  const [draft, setDraft] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | TrackerItemStatus>("all");

  const totalCount = items.length;
  const completedCount = items.filter(
    (item) => resolveTrackerStatus(item.status, item.completed) === "completed"
  ).length;
  const almostCompletedCount = items.filter(
    (item) => resolveTrackerStatus(item.status, item.completed) === "almost_completed"
  ).length;
  const inProgressCount = items.filter(
    (item) => resolveTrackerStatus(item.status, item.completed) === "in_progress"
  ).length;
  const todoCount = items.filter(
    (item) => resolveTrackerStatus(item.status, item.completed) === "todo"
  ).length;
  const onHoldCount = items.filter(
    (item) => resolveTrackerStatus(item.status, item.completed) === "on_hold"
  ).length;

  // Segment widths for the progress bar
  const completedPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const almostCompletedPct =
    totalCount > 0 ? (almostCompletedCount / totalCount) * 100 : 0;
  const inProgressPct =
    totalCount > 0 ? (inProgressCount / totalCount) * 100 : 0;

  // Weighted overall progress score: 100% completed, 85% almost completed, 50% in progress
  const weightedProgress =
    totalCount > 0
      ? Math.round(
          (completedCount * 100 +
            almostCompletedCount * 85 +
            inProgressCount * 50) /
            totalCount
        )
      : 0;

  const filteredItems = items.filter((item) => {
    if (activeFilter === "all") return true;
    return resolveTrackerStatus(item.status, item.completed) === activeFilter;
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    addItem(draft);
    setDraft("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Tracker Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <ListTodoIcon className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">Tracker</h2>
        </div>
        {totalCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {completedCount} of {totalCount} done
          </span>
        )}
      </div>

      {/* Progress & In-Progress Bar Section */}
      {totalCount > 0 && (
        <div className="flex flex-col gap-2.5 border-b border-border bg-muted/20 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Progress</span>
            <div className="flex items-center gap-2 font-mono text-muted-foreground">
              <span>{weightedProgress}% weighted</span>
              <span className="text-border">|</span>
              <span className="text-foreground font-semibold">
                {Math.round((completedCount / totalCount) * 100)}% done
              </span>
            </div>
          </div>

          {/* Segmented Progress Bar */}
          <div
            className="relative h-2 w-full overflow-hidden rounded-full bg-muted border border-border/40 flex"
            role="progressbar"
            aria-label="Overall task progress bar"
            aria-valuenow={weightedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {completedPct > 0 && (
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${completedPct}%` }}
                title={`Completed: ${completedCount}`}
              />
            )}
            {almostCompletedPct > 0 && (
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${almostCompletedPct}%` }}
                title={`Almost Completed: ${almostCompletedCount}`}
              />
            )}
            {inProgressPct > 0 && (
              <div
                className="h-full bg-sky-500 transition-all duration-300"
                style={{ width: `${inProgressPct}%` }}
                title={`In Progress: ${inProgressCount}`}
              />
            )}
          </div>

          {/* Active "In Progress" Highlight Bar */}
          {(inProgressCount > 0 || almostCompletedCount > 0) && (
            <div
              className="flex items-center justify-between rounded-md border border-sky-500/25 bg-sky-500/10 px-2.5 py-1.5 text-xs text-sky-800 dark:text-sky-200"
              data-testid="in-progress-bar"
            >
              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="size-3.5 text-sky-500 shrink-0" />
                <span>In Progress Bar:</span>
                <span className="font-semibold text-foreground">
                  {inProgressCount} active
                </span>
                {almostCompletedCount > 0 && (
                  <span className="text-muted-foreground">
                    · {almostCompletedCount} almost done
                  </span>
                )}
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">
                {Math.round(((inProgressCount + almostCompletedCount) / totalCount) * 100)}% active
              </span>
            </div>
          )}

          {/* Status Filter Tabs / Counter Badges */}
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer border",
                activeFilter === "all"
                  ? "border-foreground/20 bg-foreground/10 text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-muted"
              )}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveFilter(activeFilter === "in_progress" ? "all" : "in_progress")
              }
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer border",
                activeFilter === "in_progress"
                  ? "border-sky-500/40 bg-sky-500/15 text-sky-600 dark:text-sky-300"
                  : "border-transparent text-muted-foreground hover:bg-muted"
              )}
            >
              <Clock className="size-2.5 text-sky-500" />
              In Progress ({inProgressCount})
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveFilter(activeFilter === "almost_completed" ? "all" : "almost_completed")
              }
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer border",
                activeFilter === "almost_completed"
                  ? "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300"
                  : "border-transparent text-muted-foreground hover:bg-muted"
              )}
            >
              <Sparkles className="size-2.5 text-amber-500" />
              Almost Done ({almostCompletedCount})
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveFilter(activeFilter === "completed" ? "all" : "completed")
              }
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer border",
                activeFilter === "completed"
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                  : "border-transparent text-muted-foreground hover:bg-muted"
              )}
            >
              <CheckCircle2 className="size-2.5 text-emerald-500" />
              Done ({completedCount})
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveFilter(activeFilter === "todo" ? "all" : "todo")
              }
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer border",
                activeFilter === "todo"
                  ? "border-border bg-muted text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-muted"
              )}
            >
              <Circle className="size-2.5 text-muted-foreground" />
              To Do ({todoCount})
            </button>
            {onHoldCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  setActiveFilter(activeFilter === "on_hold" ? "all" : "on_hold")
                }
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer border",
                  activeFilter === "on_hold"
                    ? "border-zinc-500/40 bg-zinc-500/15 text-zinc-600 dark:text-zinc-300"
                    : "border-transparent text-muted-foreground hover:bg-muted"
                )}
              >
                <PauseCircle className="size-2.5 text-zinc-500" />
                On Hold ({onHoldCount})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Task Form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-b border-border p-3"
      >
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a task..."
          className="bg-muted focus-visible:ring-ring/50"
        />
        <Button type="submit" size="icon" disabled={!draft.trim()}>
          <PlusIcon className="size-4" />
          <span className="sr-only">Add task</span>
        </Button>
      </form>

      {/* Task List */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {loadedItems === undefined ? null : totalCount === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
            <ListTodoIcon className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No tasks yet — add what you&apos;re building above.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
            <FilterX className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No tasks with this status.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveFilter("all")}
              className="mt-2 text-xs"
            >
              View all tasks ({totalCount})
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredItems.map((item) => (
              <TrackerItem
                key={item.id}
                item={item}
                onToggle={toggleItem}
                onStatusChange={setItemStatus}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
