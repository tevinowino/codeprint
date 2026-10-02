"use client";

import { useState } from "react";
import { NotebookPenIcon } from "lucide-react";
import type { NotesController } from "@/lib/use-notebook-notes";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NoteCard } from "@/components/notes/note-card";

export function NotesPanel({ notes: loadedNotes, addNote, updateNote, removeNote }: NotesController) {
  const notes = loadedNotes ?? [];
  const [draft, setDraft] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    addNote(draft);
    setDraft("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium text-foreground">Notes</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-b border-border p-3">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Jot something down..."
          rows={2}
          className="bg-muted focus-visible:ring-ring/50"
        />
        <Button type="submit" size="sm" className="self-end" disabled={!draft.trim()}>
          Add note
        </Button>
      </form>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {loadedNotes === undefined ? null : notes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
            <NotebookPenIcon className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No notes yet — jot down anything worth remembering.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onUpdate={updateNote} onRemove={removeNote} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
