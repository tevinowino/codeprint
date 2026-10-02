import { cn } from "cn";
import type { ProjectStatus } from "@/domain/types";
import { PROJECT_STATUS_META, PROJECT_STATUS_ORDER } from "@/components/status-badge";

export function StatusStepper({ status }: { status: ProjectStatus }) {
  const currentIndex = PROJECT_STATUS_ORDER.indexOf(status);

  return (
    <ol className="flex items-center gap-2">
      {PROJECT_STATUS_ORDER.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs font-medium",
                isCurrent && "text-foreground",
                isComplete && "text-muted-foreground",
                !isCurrent && !isComplete && "text-muted-foreground/50"
              )}
            >
              {PROJECT_STATUS_META[step].label}
            </span>
            {index < PROJECT_STATUS_ORDER.length - 1 && (
              <span
                className={cn(
                  "h-px w-6 shrink-0",
                  isComplete ? "bg-foreground/40" : "bg-border"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
