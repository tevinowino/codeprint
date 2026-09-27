"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "cn";
import { MenuIcon, PlusIcon } from "lucide-react";
import type { Project } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/status-badge";
import { UserMenu } from "@/components/shell/user-menu";
import { NewProjectDialog } from "@/components/dashboard/new-project-dialog";

function SidebarBody({ projects }: { projects: Project[] }) {
  const pathname = usePathname();
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-zinc-100 text-xs font-bold text-zinc-950">
            C
          </span>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            CODEPRINT
          </span>
        </Link>
      </div>

      <div className="px-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
          onClick={() => setNewProjectOpen(true)}
        >
          <PlusIcon className="size-4" />
          New notebook
        </Button>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-2">
        <p className="px-2 pb-1.5 text-xs font-medium text-zinc-500">Notebooks</p>
        <ul className="flex flex-col gap-0.5">
          {projects.map((project) => {
            const isActive = pathname === `/project/${project.id}`;
            return (
              <li key={project.id}>
                <Link
                  href={`/project/${project.id}`}
                  className={cn(
                    "flex flex-col gap-1 rounded-md px-2.5 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-zinc-900 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                  )}
                >
                  <span className="truncate font-medium">{project.title}</span>
                  <StatusBadge status={project.status} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-zinc-800 px-2 py-2">
        <UserMenu />
      </div>

      <NewProjectDialog open={newProjectOpen} onOpenChange={setNewProjectOpen} />
    </div>
  );
}

export function Sidebar({ projects }: { projects: Project[] }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 md:block">
        <SidebarBody projects={projects} />
      </aside>

      {/* Mobile: top bar with a sheet-based drawer */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-3 py-2.5 md:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" />}>
            <MenuIcon className="size-5" />
            <span className="sr-only">Open navigation</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-zinc-800 bg-zinc-950 p-0">
            <SidebarBody projects={projects} />
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-zinc-100 text-xs font-bold text-zinc-950">
            C
          </span>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            CODEPRINT
          </span>
        </Link>
        <div className="size-8" aria-hidden />
      </div>
    </>
  );
}
