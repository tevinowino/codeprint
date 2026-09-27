import { MarkdownView } from "@/components/documents/markdown-view";

/** Renders a document by its file extension: markdown gets the rich renderer, everything else is shown as raw source. */
export function DocumentBody({ title, content }: { title: string; content: string }) {
  if (title.endsWith(".md")) {
    return <MarkdownView content={content} />;
  }

  return (
    <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
      <code className="font-mono text-xs leading-relaxed text-zinc-300">{content}</code>
    </pre>
  );
}
