"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import type { ScopingFormPart } from "@/domain/types";

/**
 * Renders the `renderScopingForm` tool call as selectable option chips.
 * `part.selected` marks the card as already answered (read-only, past turn);
 * otherwise it's live and calls `onAnswer` once the user submits a choice.
 */
export function ScopingFormCard({
  part,
  onAnswer,
}: {
  part: ScopingFormPart;
  onAnswer?: (selected: string[]) => void;
}) {
  const isAnswered = part.selected !== undefined;
  const [pending, setPending] = useState<string[]>([]);

  function toggleOption(option: string) {
    if (isAnswered) return;
    setPending((current) =>
      current.includes(option)
        ? current.filter((value) => value !== option)
        : [...current, option]
    );
  }

  const activeSelection = isAnswered ? (part.selected ?? []) : pending;

  return (
    <div className="flex max-w-md flex-col gap-3 rounded-xl border-2 border-zinc-900 bg-card p-4 dark:border-zinc-100">
      <p className="text-sm font-medium text-foreground">{part.question}</p>
      <div className="flex flex-wrap gap-2">
        {part.options.map((option) => {
          const isSelected = activeSelection.includes(option);
          return (
            <button
              key={option}
              type="button"
              disabled={isAnswered}
              onClick={() => toggleOption(option)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40",
                isAnswered && !isSelected && "opacity-40",
                isAnswered && "cursor-default"
              )}
            >
              {isSelected && <CheckIcon className="size-3" />}
              {option}
            </button>
          );
        })}
      </div>
      {!isAnswered && (
        <Button
          size="sm"
          className="self-start"
          disabled={pending.length === 0}
          onClick={() => onAnswer?.(pending)}
        >
          Submit answer
        </Button>
      )}
    </div>
  );
}
