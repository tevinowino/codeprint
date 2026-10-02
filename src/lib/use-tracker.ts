"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useReportedMutation } from "@/lib/convex-errors";
import {
  type TrackerItem,
  type TrackerItemStatus,
  resolveTrackerStatus,
} from "@/domain/types";

/** What TrackerPanel needs; `items` is undefined until the first server response. */
export interface TrackerController {
  items: TrackerItem[] | undefined;
  addItem: (title: string, status?: TrackerItemStatus) => void;
  setItemStatus: (id: string, status: TrackerItemStatus) => void;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
}

/**
 * Notebook-scoped task list, live from Convex. Writes are fire-and-forget:
 * the query re-renders with the new state, and failures surface as toasts.
 */
export function useTracker(projectId: string): TrackerController {
  const items = useQuery(api.trackerItems.listForProject, { projectId });
  const create = useReportedMutation(api.trackerItems.create);
  const setStatus = useReportedMutation(api.trackerItems.setStatus);
  const remove = useReportedMutation(api.trackerItems.remove);

  function addItem(title: string, status: TrackerItemStatus = "todo") {
    if (!title.trim()) return;
    void create({ projectId, title, status });
  }

  function setItemStatus(id: string, status: TrackerItemStatus) {
    void setStatus({ itemId: id, status });
  }

  function toggleItem(id: string) {
    const item = items?.find((candidate) => candidate.id === id);
    if (!item) return;
    const isCompleted = resolveTrackerStatus(item.status, item.completed) === "completed";
    void setStatus({ itemId: id, status: isCompleted ? "todo" : "completed" });
  }

  function removeItem(id: string) {
    void remove({ itemId: id });
  }

  return { items, addItem, setItemStatus, toggleItem, removeItem };
}
