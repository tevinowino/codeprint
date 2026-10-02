"use client";

import { useState } from "react";
import { ArrowUpIcon, MicIcon } from "lucide-react";
import { cn } from "cn";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useDictation } from "@/lib/use-dictation";

export function Composer({
  onSend,
  disabled = false,
}: {
  onSend: (text: string) => void;
  /** Blocks sending (typing stays possible) — used while the assistant is replying. */
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const { isSupported, isListening, start, stop } = useDictation({
    onFinalResult: (transcript) => {
      setValue((current) => (current ? `${current} ${transcript}` : transcript));
    },
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = value.trim();
    if (!text || disabled) return;
    stop();
    onSend(text);
    setValue("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-border bg-background p-3"
    >
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isListening ? "Listening…" : "Answer, or ask to change something..."}
        rows={1}
        className="max-h-40 min-h-9 resize-none bg-muted focus-visible:ring-ring/50"
      />
      {isSupported && (
        <Button
          type="button"
          variant={isListening ? "secondary" : "outline"}
          size="icon"
          className={cn(isListening && "animate-pulse")}
          onClick={() => (isListening ? stop() : start())}
        >
          <MicIcon className="size-4" />
          <span className="sr-only">{isListening ? "Stop dictation" : "Start dictation"}</span>
        </Button>
      )}
      <Button type="submit" size="icon" disabled={disabled || !value.trim()}>
        <ArrowUpIcon className="size-4" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
