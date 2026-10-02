import { cn } from "cn";
import { Logomark } from "@/components/logomark";

const SIZES = {
  sm: { box: "size-6 rounded-md", mark: "size-3.5", text: "text-sm" },
  md: { box: "size-9 rounded-lg", mark: "size-5", text: "text-base" },
} as const;

export function BrandLockup({
  size = "sm",
  iconOnly = false,
  className,
}: {
  size?: keyof typeof SIZES;
  /** Renders just the mark, no wordmark — for the collapsed sidebar rail. */
  iconOnly?: boolean;
  className?: string;
}) {
  const { box, mark, text } = SIZES[size];
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center border-2 border-zinc-900 bg-primary dark:border-zinc-100",
          box
        )}
      >
        <Logomark className={cn("text-primary-foreground", mark)} />
      </span>
      {!iconOnly && (
        <span className={cn("font-semibold tracking-tight text-foreground", text)}>
          CODEPRINT
        </span>
      )}
    </span>
  );
}
