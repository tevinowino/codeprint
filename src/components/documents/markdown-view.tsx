import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Hand-styled markdown rendering (no typography plugin) so headings, code,
// and tables match the CODEPRINT zinc palette instead of prose defaults.
const components: Components = {
  h1: (props) => (
    <h1 className="mb-4 text-xl font-semibold text-zinc-100" {...props} />
  ),
  h2: (props) => (
    <h2
      className="mt-8 mb-3 border-b border-zinc-800 pb-2 text-base font-semibold text-zinc-100 first:mt-0"
      {...props}
    />
  ),
  h3: (props) => (
    <h3 className="mt-6 mb-2 text-sm font-semibold text-zinc-200" {...props} />
  ),
  p: (props) => <p className="mb-3 text-sm leading-relaxed text-zinc-400" {...props} />,
  ul: (props) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-zinc-400" {...props} />
  ),
  ol: (props) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-zinc-400" {...props} />
  ),
  li: (props) => <li className="marker:text-zinc-600" {...props} />,
  strong: (props) => <strong className="font-semibold text-zinc-200" {...props} />,
  a: (props) => (
    <a className="text-zinc-200 underline underline-offset-4 hover:text-zinc-50" {...props} />
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="font-mono text-xs text-zinc-300" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[0.8em] text-zinc-200"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: (props) => (
    <pre
      className="mb-4 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/70 p-3.5"
      {...props}
    />
  ),
  table: (props) => (
    <div className="mb-4 overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-zinc-900" {...props} />,
  th: (props) => (
    <th
      className="border-b border-zinc-800 px-3 py-2 text-left text-xs font-medium text-zinc-400"
      {...props}
    />
  ),
  td: (props) => (
    <td className="border-b border-zinc-800/60 px-3 py-2 text-zinc-400 last:border-b-0" {...props} />
  ),
  hr: (props) => <hr className="my-6 border-zinc-800" {...props} />,
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
