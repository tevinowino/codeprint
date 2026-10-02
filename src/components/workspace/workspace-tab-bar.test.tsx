import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkspaceTabBar } from "@/components/workspace/workspace-tab-bar";

describe("WorkspaceTabBar", () => {
  it("renders every item and marks the active one as selected", () => {
    render(
      <WorkspaceTabBar
        items={[
          { value: "chat", label: "Chat" },
          { value: "documents", label: "Documents" },
        ]}
        active="documents"
        onChange={vi.fn()}
      />
    );

    expect(screen.getByRole("tab", { name: "Chat" })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tab", { name: "Documents" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("calls onChange with the clicked tab's value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <WorkspaceTabBar
        items={[
          { value: "chat", label: "Chat" },
          { value: "notes", label: "Notes" },
        ]}
        active="chat"
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole("tab", { name: "Notes" }));

    expect(onChange).toHaveBeenCalledWith("notes");
  });
});
