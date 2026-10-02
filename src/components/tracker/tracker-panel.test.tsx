import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrackerPanel } from "@/components/tracker/tracker-panel";

describe("TrackerPanel", () => {
  it("shows the empty state when there are no tasks yet", () => {
    render(
      <TrackerPanel
        items={[]}
        addItem={vi.fn()}
        setItemStatus={vi.fn()}
        toggleItem={vi.fn()}
        removeItem={vi.fn()}
      />
    );

    expect(
      screen.getByText("No tasks yet — add what you're building above.")
    ).toBeInTheDocument();
  });

  it("shows neither the empty state nor tasks while the first response is still loading", () => {
    render(
      <TrackerPanel
        items={undefined}
        addItem={vi.fn()}
        setItemStatus={vi.fn()}
        toggleItem={vi.fn()}
        removeItem={vi.fn()}
      />
    );

    expect(
      screen.queryByText("No tasks yet — add what you're building above.")
    ).not.toBeInTheDocument();
  });

  it("asks to add the task typed into the composer", async () => {
    const user = userEvent.setup();
    const addItem = vi.fn();
    render(
      <TrackerPanel
        items={[]}
        addItem={addItem}
        setItemStatus={vi.fn()}
        toggleItem={vi.fn()}
        removeItem={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText("Add a task..."), "Write the streak endpoint");
    await user.click(screen.getByRole("button", { name: "Add task" }));

    expect(addItem).toHaveBeenCalledWith("Write the streak endpoint");
  });

  it("shows the progress count for the tasks it is given", () => {
    render(
      <TrackerPanel
        items={[
          { id: "task_1", projectId: "p", title: "Set up the schema", completed: true, status: "completed", createdAt: 1 },
          { id: "task_2", projectId: "p", title: "Write the API", completed: false, status: "todo", createdAt: 2 },
        ]}
        addItem={vi.fn()}
        setItemStatus={vi.fn()}
        toggleItem={vi.fn()}
        removeItem={vi.fn()}
      />
    );

    expect(screen.getByText("1 of 2 done")).toBeInTheDocument();
    expect(screen.getByText("Set up the schema")).toHaveClass("line-through");
  });

  it("asks to toggle a task when its checkbox is clicked", async () => {
    const user = userEvent.setup();
    const toggleItem = vi.fn();
    render(
      <TrackerPanel
        items={[
          { id: "task_1", projectId: "p", title: "Set up the schema", completed: false, createdAt: 1 },
        ]}
        addItem={vi.fn()}
        setItemStatus={vi.fn()}
        toggleItem={toggleItem}
        removeItem={vi.fn()}
      />
    );

    await user.click(screen.getByRole("checkbox", { name: 'Mark "Set up the schema" complete' }));

    expect(toggleItem).toHaveBeenCalledWith("task_1");
  });

  it("asks to remove a task when its delete button is clicked", async () => {
    const user = userEvent.setup();
    const removeItem = vi.fn();
    render(
      <TrackerPanel
        items={[
          { id: "task_1", projectId: "p", title: "Temporary task", completed: false, createdAt: 1 },
        ]}
        addItem={vi.fn()}
        setItemStatus={vi.fn()}
        toggleItem={vi.fn()}
        removeItem={removeItem}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete task" }));

    expect(removeItem).toHaveBeenCalledWith("task_1");
  });

  it("renders the In Progress bar and progress breakdown for multi-status tasks", () => {
    render(
      <TrackerPanel
        items={[
          { id: "task_1", projectId: "p", title: "Task 1", completed: true, status: "completed", createdAt: 1 },
          { id: "task_2", projectId: "p", title: "Task 2", completed: false, status: "in_progress", createdAt: 2 },
          { id: "task_3", projectId: "p", title: "Task 3", completed: false, status: "almost_completed", createdAt: 3 },
        ]}
        addItem={vi.fn()}
        setItemStatus={vi.fn()}
        toggleItem={vi.fn()}
        removeItem={vi.fn()}
      />
    );

    expect(screen.getByText("1 of 3 done")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Overall task progress bar" })
    ).toBeInTheDocument();

    const inProgressBar = screen.getByTestId("in-progress-bar");
    expect(inProgressBar).toHaveTextContent("In Progress Bar:");
    expect(inProgressBar).toHaveTextContent("1 active");
    expect(inProgressBar).toHaveTextContent("1 almost done");

    expect(screen.getByRole("button", { name: /^In Progress \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Almost Done \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Done \(1\)/i })).toBeInTheDocument();
  });

  it("filters tasks when clicking status filter buttons", async () => {
    const user = userEvent.setup();
    render(
      <TrackerPanel
        items={[
          { id: "task_1", projectId: "p", title: "Active task in progress", completed: false, status: "in_progress", createdAt: 1 },
          { id: "task_2", projectId: "p", title: "Completed feature", completed: true, status: "completed", createdAt: 2 },
        ]}
        addItem={vi.fn()}
        setItemStatus={vi.fn()}
        toggleItem={vi.fn()}
        removeItem={vi.fn()}
      />
    );

    expect(screen.getByText("Active task in progress")).toBeInTheDocument();
    expect(screen.getByText("Completed feature")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /In Progress \(1\)/i }));

    expect(screen.getByText("Active task in progress")).toBeInTheDocument();
    expect(screen.queryByText("Completed feature")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /All \(2\)/i }));
    expect(screen.getByText("Completed feature")).toBeInTheDocument();
  });
});
