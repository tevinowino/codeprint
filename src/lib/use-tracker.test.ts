import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTracker } from "@/lib/use-tracker";

const { queryResult, createTask, setTaskStatus, removeTask } = vi.hoisted(() => ({
  queryResult: { current: undefined as unknown },
  createTask: vi.fn(),
  setTaskStatus: vi.fn(),
  removeTask: vi.fn(),
}));

vi.mock("convex/react", async () => {
  const { getFunctionName } = await import("convex/server");
  const mutations: Record<string, unknown> = {
    "trackerItems:create": createTask,
    "trackerItems:setStatus": setTaskStatus,
    "trackerItems:remove": removeTask,
  };
  return {
    useQuery: () => queryResult.current,
    useMutation: (reference: never) => mutations[getFunctionName(reference)],
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useTracker", () => {
  it("passes through undefined items while the first response is loading", () => {
    queryResult.current = undefined;

    const { result } = renderHook(() => useTracker("project_1"));

    expect(result.current.items).toBeUndefined();
  });

  it("creates a task in the notebook with the todo status by default", () => {
    queryResult.current = [];
    const { result } = renderHook(() => useTracker("project_1"));

    result.current.addItem("Write the schema");

    expect(createTask).toHaveBeenCalledWith({
      projectId: "project_1",
      title: "Write the schema",
      status: "todo",
    });
  });

  it("does not create a task from a blank title", () => {
    queryResult.current = [];
    const { result } = renderHook(() => useTracker("project_1"));

    result.current.addItem("   ");

    expect(createTask).not.toHaveBeenCalled();
  });

  it("toggling an unfinished task marks it completed", () => {
    queryResult.current = [
      { id: "task_1", projectId: "project_1", title: "A", completed: false, status: "in_progress", createdAt: 1 },
    ];
    const { result } = renderHook(() => useTracker("project_1"));

    result.current.toggleItem("task_1");

    expect(setTaskStatus).toHaveBeenCalledWith({ itemId: "task_1", status: "completed" });
  });

  it("toggling a completed task sends it back to todo", () => {
    queryResult.current = [
      { id: "task_1", projectId: "project_1", title: "A", completed: true, status: "completed", createdAt: 1 },
    ];
    const { result } = renderHook(() => useTracker("project_1"));

    result.current.toggleItem("task_1");

    expect(setTaskStatus).toHaveBeenCalledWith({ itemId: "task_1", status: "todo" });
  });

  it("ignores a toggle for a task that is not in the list", () => {
    queryResult.current = [];
    const { result } = renderHook(() => useTracker("project_1"));

    result.current.toggleItem("missing");

    expect(setTaskStatus).not.toHaveBeenCalled();
  });

  it("sets an explicit status and removes tasks by id", () => {
    queryResult.current = [];
    const { result } = renderHook(() => useTracker("project_1"));

    result.current.setItemStatus("task_1", "on_hold");
    result.current.removeItem("task_2");

    expect(setTaskStatus).toHaveBeenCalledWith({ itemId: "task_1", status: "on_hold" });
    expect(removeTask).toHaveBeenCalledWith({ itemId: "task_2" });
  });
});
