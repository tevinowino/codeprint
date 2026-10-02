import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentTabBar } from "@/components/documents/document-tab-bar";

describe("DocumentTabBar", () => {
  it("renders every title and marks the active one as selected", () => {
    render(
      <DocumentTabBar
        titles={["architecture.md", "design.md"]}
        active="design.md"
        onChange={vi.fn()}
      />
    );

    expect(screen.getByRole("tab", { name: "architecture.md" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
    expect(screen.getByRole("tab", { name: "design.md" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("calls onChange with the clicked document's title", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DocumentTabBar
        titles={["architecture.md", "schema.sql"]}
        active="architecture.md"
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole("tab", { name: "schema.sql" }));

    expect(onChange).toHaveBeenCalledWith("schema.sql");
  });
});
