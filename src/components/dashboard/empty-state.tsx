import { NotebookPenIcon } from "lucide-react";

export function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-800 py-24 text-center">
      <NotebookPenIcon className="size-8 text-zinc-700" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-zinc-300">No notebooks yet</p>
        <p className="text-sm text-zinc-500">
          Start a new notebook to scope your first project.
        </p>
      </div>
      <button
        onClick={onCreateClick}
        className="mt-2 text-sm font-medium text-zinc-100 underline underline-offset-4 hover:text-zinc-300"
      >
        Create a notebook
      </button>
    </div>
  );
}
