import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import type { Project } from "@/domain/types";

describe("DashboardView", () => {
  it("shows the empty state and no project cards when there are no projects", () => {
    render(<DashboardView projects={[]} />);

    expect(screen.getByText("No notebooks yet")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders a card per project, each linking to its workspace", () => {
    const projects: Project[] = [
      {
        id: "proj_habit_tracker",
        title: "Habit Tracker API",
        description: "Streak-based habit tracking.",
        status: "architecting",
        createdAt: Date.now() - 1000,
        updatedAt: Date.now() - 1000,
      },
      {
        id: "proj_recipe_box",
        title: "Recipe Box",
        status: "completed",
        createdAt: Date.now() - 2000,
        updatedAt: Date.now() - 2000,
      },
    ];

    render(<DashboardView projects={projects} />);

    expect(screen.queryByText("No notebooks yet")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Habit Tracker API/ })).toHaveAttribute(
      "href",
      "/project/proj_habit_tracker"
    );
    expect(screen.getByRole("link", { name: /Recipe Box/ })).toHaveAttribute(
      "href",
      "/project/proj_recipe_box"
    );
  });
});
