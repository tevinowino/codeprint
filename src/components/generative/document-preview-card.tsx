import { FileTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DocumentPreviewPart } from "@/domain/types";

export function DocumentPreviewCard({
  part,
  onOpen,
}: {
  part: DocumentPreviewPart;
  onOpen: (docTitle: string) => void;
}) {
  return (
    <div className="flex max-w-md items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/55 p-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
        <FileTextIcon className="size-4 text-zinc-400" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-mono text-sm font-medium text-zinc-100">{part.docTitle}</p>
        <p className="text-sm text-zinc-500">{part.summary}</p>
        <Button
          variant="link"
          size="sm"
          className="h-auto self-start px-0 text-zinc-300 hover:text-zinc-100"
          onClick={() => onOpen(part.docTitle)}
        >
          Open document →
        </Button>
      </div>
    </div>
  );
}
