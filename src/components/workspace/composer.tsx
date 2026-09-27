"use client";

import { useState } from "react";
import { ArrowUpIcon } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [value, setValue] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue("");
    toast.message("AI wiring lands in a later phase", {
      description: "Your message was added to the transcript, but nothing will reply yet.",
    });
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
      className="flex items-end gap-2 border-t border-zinc-800 bg-zinc-950 p-3"
    >
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Answer, or ask to change something..."
        rows={1}
        className="max-h-40 min-h-9 resize-none border-zinc-800 bg-zinc-900 focus-visible:border-zinc-600 focus-visible:ring-zinc-700/50"
      />
      <Button type="submit" size="icon" disabled={!value.trim()}>
        <ArrowUpIcon className="size-4" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
