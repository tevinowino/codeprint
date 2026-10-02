import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewProjectDialog } from "@/components/dashboard/new-project-dialog";

const { createProject, push } = vi.hoisted(() => ({ createProject: vi.fn(), push: vi.fn() }));

vi.mock("@/lib/use-projects", () => ({ useCreateProject: () => createProject }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/components/ui/goey-toaster", () => ({
  gooeyToast: { success: vi.fn(), error: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("NewProjectDialog", () => {
  it("creates the notebook with the typed title, closes, and opens it", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    createProject.mockResolvedValue("project_42");
    render(<NewProjectDialog open={true} onOpenChange={onOpenChange} />);

    await user.type(screen.getByPlaceholderText("e.g. Habit Tracker API"), "  Recipe Box  ");
    await user.click(screen.getByRole("button", { name: "Create notebook" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/project/project_42"));
    expect(createProject).toHaveBeenCalledWith({ title: "Recipe Box" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("stays open and does not navigate when creation fails", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    createProject.mockResolvedValue(undefined);
    render(<NewProjectDialog open={true} onOpenChange={onOpenChange} />);

    await user.type(screen.getByPlaceholderText("e.g. Habit Tracker API"), "Recipe Box");
    await user.click(screen.getByRole("button", { name: "Create notebook" }));

    await waitFor(() => expect(createProject).toHaveBeenCalled());
    expect(push).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("keeps the create button disabled until a title is typed", () => {
    render(<NewProjectDialog open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Create notebook" })).toBeDisabled();
  });
});
