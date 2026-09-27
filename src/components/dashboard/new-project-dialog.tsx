"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    // Persistence lands with the Convex phase — for now this just previews the flow.
    toast.success(`"${title.trim()}" would be created`, {
      description: "Notebook creation isn't wired up yet — this is a design preview.",
    });
    setTitle("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>New notebook</DialogTitle>
            <DialogDescription>
              Give your project a name. You&apos;ll scope the details in the interview next.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="e.g. Habit Tracker API"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <DialogFooter>
            <Button type="submit" disabled={!title.trim()}>
              Create notebook
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
