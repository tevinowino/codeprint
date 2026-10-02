import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Hand-styled markdown rendering (no typography plugin) so headings, code,
// and tables match CODEPRINT's theme tokens instead of prose defaults.
const components: Components = {
  h1: (props) => (
    <h1 className="mb-4 text-xl font-semibold text-foreground" {...props} />
  ),
  h2: (props) => (
    <h2
      className="mt-8 mb-3 border-b border-border pb-2 text-base font-semibold text-foreground first:mt-0"
      {...props}
    />
  ),
  h3: (props) => (
    <h3 className="mt-6 mb-2 text-sm font-semibold text-foreground" {...props} />
  ),
  p: (props) => <p className="mb-3 text-sm leading-relaxed text-muted-foreground" {...props} />,
  ul: (props) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground" {...props} />
  ),
  ol: (props) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground" {...props} />
  ),
  li: (props) => <li className="marker:text-muted-foreground/60" {...props} />,
  strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
  a: (props) => (
    <a className="text-foreground underline underline-offset-4 hover:text-muted-foreground" {...props} />
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="font-mono text-xs text-foreground/90" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.8em] text-foreground"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: (props) => (
    <pre
      className="mb-4 overflow-x-auto rounded-lg border border-border bg-muted p-3.5"
      {...props}
    />
  ),
  table: (props) => (
    <div className="mb-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-muted" {...props} />,
  th: (props) => (
    <th
      className="border-b border-border px-3 py-2 text-left text-xs font-medium text-muted-foreground"
      {...props}
    />
  ),
  td: (props) => (
    <td className="border-b border-border/60 px-3 py-2 text-muted-foreground last:border-b-0" {...props} />
  ),
  hr: (props) => <hr className="my-6 border-border" {...props} />,
};

export function MarkdownView({ content }: { content: string }) {
  return (
    <div className="max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
