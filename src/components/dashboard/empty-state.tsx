import { NotebookPenIcon } from "lucide-react";

export function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-24 text-center">
      <NotebookPenIcon className="size-8 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">No notebooks yet</p>
        <p className="text-sm text-muted-foreground">
          Start a new notebook to scope your first project.
        </p>
      </div>
      <button
        onClick={onCreateClick}
        className="mt-2 text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
      >
        Create a notebook
      </button>
    </div>
  );
}
