"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gooeyToast } from "@/components/ui/goey-toaster";
import { useCreateProject } from "@/lib/use-projects";
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
  const router = useRouter();
  const createProject = useCreateProject();
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || isCreating) return;

    setIsCreating(true);
    const projectId = await createProject({ title: trimmedTitle });
    setIsCreating(false);
    if (!projectId) return;

    gooeyToast.success(`Created "${trimmedTitle}"`);
    setTitle("");
    onOpenChange(false);
    router.push(`/project/${projectId}`);
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
            <Button type="submit" disabled={!title.trim() || isCreating}>
              Create notebook
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
