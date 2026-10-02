import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNotebookNotes } from "@/lib/use-notebook-notes";

const { queryResult, createNote, updateNote, removeNote } = vi.hoisted(() => ({
  queryResult: { current: undefined as unknown },
  createNote: vi.fn(),
  updateNote: vi.fn(),
  removeNote: vi.fn(),
}));

vi.mock("convex/react", async () => {
  const { getFunctionName } = await import("convex/server");
  const mutations: Record<string, unknown> = {
    "notes:create": createNote,
    "notes:update": updateNote,
    "notes:remove": removeNote,
  };
  return {
    useQuery: () => queryResult.current,
    useMutation: (reference: never) => mutations[getFunctionName(reference)],
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useNotebookNotes", () => {
  it("creates a note in the notebook", () => {
    queryResult.current = [];
    const { result } = renderHook(() => useNotebookNotes("project_1"));

    result.current.addNote("Add rate limiting");

    expect(createNote).toHaveBeenCalledWith({ projectId: "project_1", content: "Add rate limiting" });
  });

  it("does not create a note from blank text", () => {
    queryResult.current = [];
    const { result } = renderHook(() => useNotebookNotes("project_1"));

    result.current.addNote("  ");

    expect(createNote).not.toHaveBeenCalled();
  });

  it("updates and removes notes by id", () => {
    queryResult.current = [];
    const { result } = renderHook(() => useNotebookNotes("project_1"));

    result.current.updateNote("note_1", "Second draft");
    result.current.removeNote("note_2");

    expect(updateNote).toHaveBeenCalledWith({ noteId: "note_1", content: "Second draft" });
    expect(removeNote).toHaveBeenCalledWith({ noteId: "note_2" });
  });
});
