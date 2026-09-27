"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { cn } from "cn";
import type { Project, ProjectDocument, ProjectMessage } from "@/domain/types";
import { StatusStepper } from "@/components/workspace/status-stepper";
import { ChatPanel } from "@/components/workspace/chat-panel";
import { DocumentPanel } from "@/components/documents/document-panel";

export function Workspace({
  project,
  initialMessages,
  documents,
}: {
  project: Project;
  initialMessages: ProjectMessage[];
  documents: ProjectDocument[];
}) {
  const [activeDocTitle, setActiveDocTitle] = useState<string | null>(
    documents[0]?.title ?? null
  );
  const [mobileView, setMobileView] = useState<"chat" | "docs">("chat");

  function handleOpenDocument(docTitle: string) {
    setActiveDocTitle(docTitle);
    setMobileView("docs");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-col gap-2 border-b border-zinc-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden text-zinc-600 hover:text-zinc-300 sm:block"
          >
            <ArrowLeftIcon className="size-4" />
            <span className="sr-only">Back to notebooks</span>
          </Link>
          <h1 className="truncate text-sm font-semibold text-zinc-100">{project.title}</h1>
        </div>
        <StatusStepper status={project.status} />
      </header>

      {/* Mobile: Chat / Docs toggle */}
      <div className="flex border-b border-zinc-800 md:hidden">
        {(["chat", "docs"] as const).map((view) => (
          <button
            key={view}
            onClick={() => setMobileView(view)}
            className={cn(
              "flex-1 border-b-2 py-2.5 text-sm font-medium capitalize transition-colors",
              mobileView === view
                ? "border-zinc-100 text-zinc-100"
                : "border-transparent text-zinc-500"
            )}
          >
            {view === "chat" ? "Chat" : "Documents"}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        <div
          className={cn(
            "min-h-0 w-full flex-col border-zinc-800 md:flex md:w-105 md:border-r lg:w-120",
            mobileView === "chat" ? "flex" : "hidden"
          )}
        >
          <ChatPanel
            projectId={project.id}
            initialMessages={initialMessages}
            onOpenDocument={handleOpenDocument}
          />
        </div>

        <div
          className={cn(
            "min-h-0 w-full flex-1 md:flex",
            mobileView === "docs" ? "flex" : "hidden"
          )}
        >
          <DocumentPanel
            documents={documents}
            activeTitle={activeDocTitle}
            onActiveTitleChange={setActiveDocTitle}
          />
        </div>
      </div>
    </div>
  );
}
