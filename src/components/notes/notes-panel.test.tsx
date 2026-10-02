import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotesPanel } from "@/components/notes/notes-panel";

describe("NotesPanel", () => {
  it("shows the empty state when there are no notes yet", () => {
    render(<NotesPanel notes={[]} addNote={vi.fn()} updateNote={vi.fn()} removeNote={vi.fn()} />);

    expect(
      screen.getByText("No notes yet — jot down anything worth remembering.")
    ).toBeInTheDocument();
  });

  it("shows neither the empty state nor notes while the first response is still loading", () => {
    render(
      <NotesPanel notes={undefined} addNote={vi.fn()} updateNote={vi.fn()} removeNote={vi.fn()} />
    );

    expect(
      screen.queryByText("No notes yet — jot down anything worth remembering.")
    ).not.toBeInTheDocument();
  });

  it("asks to add the note typed into the composer, then clears the field", async () => {
    const user = userEvent.setup();
    const addNote = vi.fn();
    render(<NotesPanel notes={[]} addNote={addNote} updateNote={vi.fn()} removeNote={vi.fn()} />);
    const composer = screen.getByPlaceholderText("Jot something down...");

    await user.type(composer, "Remember to add rate limiting.");
    await user.click(screen.getByRole("button", { name: "Add note" }));

    expect(addNote).toHaveBeenCalledWith("Remember to add rate limiting.");
    expect(composer).toHaveValue("");
  });

  it("asks to save an edit to an existing note when the textarea loses focus", async () => {
    const user = userEvent.setup();
    const updateNote = vi.fn();
    render(
      <NotesPanel
        notes={[
          { id: "note_1", projectId: "p", content: "Original content", createdAt: 1, updatedAt: 1 },
        ]}
        addNote={vi.fn()}
        updateNote={updateNote}
        removeNote={vi.fn()}
      />
    );

    const textarea = screen.getByDisplayValue("Original content");
    await user.clear(textarea);
    await user.type(textarea, "Edited content");
    await user.tab();

    expect(updateNote).toHaveBeenCalledWith("note_1", "Edited content");
  });

  it("asks to remove a note when its delete button is clicked", async () => {
    const user = userEvent.setup();
    const removeNote = vi.fn();
    render(
      <NotesPanel
        notes={[
          { id: "note_1", projectId: "p", content: "Temporary note", createdAt: 1, updatedAt: 1 },
        ]}
        addNote={vi.fn()}
        updateNote={vi.fn()}
        removeNote={removeNote}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete note" }));

    expect(removeNote).toHaveBeenCalledWith("note_1");
  });
});
