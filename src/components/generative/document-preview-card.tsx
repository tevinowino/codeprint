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
    <div className="flex max-w-md items-start gap-3 rounded-xl border-2 border-zinc-900 bg-card p-4 dark:border-zinc-100">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <FileTextIcon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-mono text-sm font-medium text-foreground">{part.docTitle}</p>
        <p className="text-sm text-muted-foreground">{part.summary}</p>
        <Button
          variant="link"
          size="sm"
          className="h-auto self-start px-0 text-muted-foreground hover:text-foreground"
          onClick={() => onOpen(part.docTitle)}
        >
          Open document →
        </Button>
      </div>
    </div>
  );
}
