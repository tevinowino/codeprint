import { CheckIcon, FileTextIcon } from "lucide-react";

/**
 * A representational miniature of the real workspace — same tokens and
 * component language as DocumentPanel/ScopingFormCard — instead of a
 * generic illustration standing in for the product.
 */
export function ProductPreview() {
  return (
    <div className="relative">
      <div className="w-[380px] max-w-full rounded-2xl bg-card shadow-[0_40px_80px_-30px_rgba(0,0,0,0.3)] sm:w-110 dark:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-4 border-b border-border px-4 py-2.5">
          <span className="font-mono text-xs font-medium text-foreground">architecture.md</span>
          <span className="font-mono text-xs text-muted-foreground">design.md</span>
          <span className="font-mono text-xs text-muted-foreground">schema.sql</span>
        </div>
        <div className="flex flex-col gap-3 p-5">
          <p className="text-sm font-semibold text-foreground">Architecture — Habit Tracker API</p>
          <div className="flex flex-col gap-1.5">
            <div className="h-2 w-full rounded-full bg-muted" />
            <div className="h-2 w-4/5 rounded-full bg-muted" />
            <div className="h-2 w-3/5 rounded-full bg-muted" />
          </div>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">Core Entities</p>
          <div className="flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5">
            <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground">schema.sql</span>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-8 left-2 w-56 rounded-xl bg-card p-3.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.25)] sm:-left-14 sm:w-64 dark:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]">
        <p className="text-xs font-medium text-foreground">API access model</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
            <CheckIcon className="size-3" />
            Full read/write
          </span>
          <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            Read-only
          </span>
        </div>
      </div>
    </div>
  );
}
