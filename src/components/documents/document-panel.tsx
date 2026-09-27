"use client";

import { useState } from "react";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import type { ProjectDocument } from "@/domain/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocumentBody } from "@/components/documents/document-body";
import { formatRelativeTime } from "@/lib/format";

export function DocumentPanel({
  documents,
  activeTitle,
  onActiveTitleChange,
}: {
  documents: ProjectDocument[];
  activeTitle: string | null;
  onActiveTitleChange: (title: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  if (documents.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <p className="text-sm text-zinc-500">
          No documents yet — they&apos;ll appear here as the interview progresses.
        </p>
      </div>
    );
  }

  const value = activeTitle && documents.some((doc) => doc.title === activeTitle)
    ? activeTitle
    : documents[0].title;
  const activeDocument = documents.find((doc) => doc.title === value) ?? documents[0];

  async function handleCopy() {
    await navigator.clipboard.writeText(activeDocument.content);
    setCopied(true);
    toast.success(`Copied ${activeDocument.title}`);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Tabs value={value} onValueChange={onActiveTitleChange} className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 px-3 py-2">
        <TabsList variant="line" className="overflow-x-auto">
          {documents.map((doc) => (
            <TabsTrigger key={doc.title} value={doc.title} className="font-mono">
              {doc.title}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="outline" className="border-zinc-700 text-zinc-500">
            v{activeDocument.version}
          </Badge>
          <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
            <CopyIcon className="size-3.5" />
            <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      </div>

      {documents.map((doc) => (
        <TabsContent key={doc.title} value={doc.title} className="min-h-0 flex-1 overflow-y-auto p-5">
          <p className="mb-4 text-xs text-zinc-600">
            Updated {formatRelativeTime(doc.updatedAt)}
          </p>
          <DocumentBody title={doc.title} content={doc.content} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
