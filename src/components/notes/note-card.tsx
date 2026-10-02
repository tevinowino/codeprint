"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/format";
import type { NotebookNote } from "@/domain/types";

export function NoteCard({
  note,
  onUpdate,
  onRemove,
}: {
  note: NotebookNote;
  onUpdate: (id: string, content: string) => void;
  onRemove: (id: string) => void;
}) {
  const [draft, setDraft] = useState(note.content);

  function handleBlur() {
    if (draft.trim() && draft !== note.content) {
      onUpdate(note.id, draft.trim());
    } else {
      setDraft(note.content);
    }
  }

  return (
    <div className="group flex flex-col gap-2 rounded-xl border-2 border-zinc-900 bg-card p-3.5 dark:border-zinc-100">
      <div className="flex items-start justify-between gap-2">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={handleBlur}
          rows={1}
          className="min-h-7 flex-1 resize-none border-none bg-transparent px-0 py-0.5 text-sm leading-relaxed text-foreground shadow-none focus-visible:ring-0"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground opacity-60 hover:text-foreground group-hover:opacity-100"
          onClick={() => onRemove(note.id)}
        >
          <XIcon className="size-3.5" />
          <span className="sr-only">Delete note</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Updated {formatRelativeTime(note.updatedAt)}</p>
    </div>
  );
}
