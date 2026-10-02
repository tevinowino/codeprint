"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useReportedMutation } from "@/lib/convex-errors";
import type { NotebookNote } from "@/domain/types";

/** What NotesPanel needs; `notes` is undefined until the first server response. */
export interface NotesController {
  notes: NotebookNote[] | undefined;
  addNote: (content: string) => void;
  updateNote: (id: string, content: string) => void;
  removeNote: (id: string) => void;
}

/** Notebook-scoped notes, live from Convex, most recently edited first. */
export function useNotebookNotes(projectId: string): NotesController {
  const notes = useQuery(api.notes.listForProject, { projectId });
  const create = useReportedMutation(api.notes.create);
  const update = useReportedMutation(api.notes.update);
  const remove = useReportedMutation(api.notes.remove);

  function addNote(content: string) {
    if (!content.trim()) return;
    void create({ projectId, content });
  }

  function updateNote(id: string, content: string) {
    void update({ noteId: id, content });
  }

  function removeNote(id: string) {
    void remove({ noteId: id });
  }

  return { notes, addNote, updateNote, removeNote };
}
