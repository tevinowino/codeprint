import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentPanel } from "@/components/documents/document-panel";
import type { ProjectDocument } from "@/domain/types";

describe("DocumentPanel", () => {
  it("shows an empty-state message when the project has no documents yet", () => {
    render(
      <DocumentPanel documents={[]} activeTitle={null} onActiveTitleChange={vi.fn()} />
    );

    expect(
      screen.getByText("No documents yet — they'll appear here as the interview progresses.")
    ).toBeInTheDocument();
  });

  it("renders the markdown content of the active tab", () => {
    const documents: ProjectDocument[] = [
      {
        id: "doc_1",
        projectId: "proj_1",
        title: "architecture.md",
        content: "# Architecture\n\nSome overview text.",
        version: 2,
        updatedAt: Date.now(),
      },
      {
        id: "doc_2",
        projectId: "proj_1",
        title: "design.md",
        content: "# Design\n\nSome design notes.",
        version: 1,
        updatedAt: Date.now(),
      },
    ];

    render(
      <DocumentPanel
        documents={documents}
        activeTitle="design.md"
        onActiveTitleChange={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: "Design" })).toBeInTheDocument();
    expect(screen.getByText("v1")).toBeInTheDocument();
  });

  it("switches tabs and calls onActiveTitleChange when a different document tab is clicked", async () => {
    const user = userEvent.setup();
    const onActiveTitleChange = vi.fn();
    const documents: ProjectDocument[] = [
      {
        id: "doc_1",
        projectId: "proj_1",
        title: "architecture.md",
        content: "# Architecture",
        version: 1,
        updatedAt: Date.now(),
      },
      {
        id: "doc_2",
        projectId: "proj_1",
        title: "schema.sql",
        content: "create table users (id uuid primary key);",
        version: 1,
        updatedAt: Date.now(),
      },
    ];

    render(
      <DocumentPanel
        documents={documents}
        activeTitle="architecture.md"
        onActiveTitleChange={onActiveTitleChange}
      />
    );

    await user.click(screen.getByRole("tab", { name: "schema.sql" }));

    expect(onActiveTitleChange).toHaveBeenCalledWith("schema.sql");
  });

  it("renders a non-markdown document as raw source instead of interpreting it as markdown", () => {
    const documents: ProjectDocument[] = [
      {
        id: "doc_1",
        projectId: "proj_1",
        title: "schema.sql",
        content: "create table users (id uuid primary key);",
        version: 1,
        updatedAt: Date.now(),
      },
    ];

    render(
      <DocumentPanel documents={documents} activeTitle="schema.sql" onActiveTitleChange={vi.fn()} />
    );

    expect(screen.getByText("create table users (id uuid primary key);")).toBeInTheDocument();
  });
});
