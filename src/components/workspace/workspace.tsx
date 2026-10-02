"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { cn } from "cn";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Project } from "@/domain/types";
import { useNotebookNotes } from "@/lib/use-notebook-notes";
import { useProjectChat } from "@/lib/use-project-chat";
import { useTracker } from "@/lib/use-tracker";
import { StatusStepper } from "@/components/workspace/status-stepper";
import { ChatPanel } from "@/components/workspace/chat-panel";
import {
  WorkspaceTabBar,
  type WorkspaceTabBarItem,
} from "@/components/workspace/workspace-tab-bar";
import { DocumentPanel } from "@/components/documents/document-panel";
import { TrackerPanel } from "@/components/tracker/tracker-panel";
import { NotesPanel } from "@/components/notes/notes-panel";

type MobileView = "chat" | "documents" | "tracker" | "notes";
type RightView = "documents" | "tracker" | "notes";

const MOBILE_TABS: WorkspaceTabBarItem<MobileView>[] = [
  { value: "chat", label: "Chat" },
  { value: "documents", label: "Documents" },
  { value: "tracker", label: "Tracker" },
  { value: "notes", label: "Notes" },
];

const RIGHT_TABS: WorkspaceTabBarItem<RightView>[] = [
  { value: "documents", label: "Documents" },
  { value: "tracker", label: "Tracker" },
  { value: "notes", label: "Notes" },
];

export function Workspace({ project }: { project: Project }) {
  const chat = useProjectChat(project.id);
  const tracker = useTracker(project.id);
  const notes = useNotebookNotes(project.id);
  const documents = useQuery(api.documents.listForProject, { projectId: project.id });
  // null = "whichever document comes first"; DocumentPanel resolves it.
  const [activeDocTitle, setActiveDocTitle] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>("chat");
  const [rightView, setRightView] = useState<RightView>("documents");

  function handleOpenDocument(docTitle: string) {
    setActiveDocTitle(docTitle);
    setMobileView("documents");
    setRightView("documents");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden text-muted-foreground hover:text-foreground sm:block"
          >
            <ArrowLeftIcon className="size-4" />
            <span className="sr-only">Back to notebooks</span>
          </Link>
          <h1 className="truncate text-sm font-semibold text-foreground">{project.title}</h1>
        </div>
        <StatusStepper status={project.status} />
      </header>

      <WorkspaceTabBar
        className="md:hidden"
        items={MOBILE_TABS}
        active={mobileView}
        onChange={setMobileView}
      />

      <div className="flex min-h-0 flex-1">
        <div
          className={cn(
            "min-h-0 w-full flex-col border-border md:flex md:w-105 md:border-r lg:w-120",
            mobileView === "chat" ? "flex" : "hidden"
          )}
        >
          <ChatPanel {...chat} onOpenDocument={handleOpenDocument} />
        </div>

        <div
          className={cn(
            "min-h-0 w-full flex-1 flex-col md:flex",
            mobileView === "chat" ? "hidden" : "flex"
          )}
        >
          <WorkspaceTabBar
            className="hidden md:flex"
            items={RIGHT_TABS}
            active={rightView}
            onChange={setRightView}
          />

          <div className="flex min-h-0 flex-1">
            <div
              className={cn(
                "min-h-0 w-full flex-col",
                mobileView === "documents" ? "flex" : "hidden",
                rightView === "documents" ? "md:flex" : "md:hidden"
              )}
            >
              <DocumentPanel
                documents={documents ?? []}
                activeTitle={activeDocTitle}
                onActiveTitleChange={setActiveDocTitle}
              />
            </div>

            <div
              className={cn(
                "min-h-0 w-full flex-col",
                mobileView === "tracker" ? "flex" : "hidden",
                rightView === "tracker" ? "md:flex" : "md:hidden"
              )}
            >
              <TrackerPanel {...tracker} />
            </div>

            <div
              className={cn(
                "min-h-0 w-full flex-col",
                mobileView === "notes" ? "flex" : "hidden",
                rightView === "notes" ? "md:flex" : "md:hidden"
              )}
            >
              <NotesPanel {...notes} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
