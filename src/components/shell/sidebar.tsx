"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "cn";
import { MenuIcon, PanelLeftCloseIcon, PanelLeftIcon, PlusIcon } from "lucide-react";
import type { Project } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PROJECT_STATUS_META, StatusBadge } from "@/components/status-badge";
import { BrandLockup } from "@/components/brand-lockup";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/shell/user-menu";
import { NewProjectDialog } from "@/components/dashboard/new-project-dialog";

function SidebarBody({
  projects,
  collapsed = false,
  onToggleCollapsed,
}: {
  projects: Project[];
  collapsed?: boolean;
  /** Omitted on mobile, where the sheet itself is the collapse mechanism. */
  onToggleCollapsed?: () => void;
}) {
  const pathname = usePathname();
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-4",
          collapsed && "flex-col justify-center px-2"
        )}
      >
        <Link href="/dashboard" className={collapsed ? undefined : "flex-1"}>
          <BrandLockup iconOnly={collapsed} />
        </Link>
        {onToggleCollapsed && (
          <Button variant="ghost" size="icon-sm" onClick={onToggleCollapsed}>
            {collapsed ? (
              <PanelLeftIcon className="size-4" />
            ) : (
              <PanelLeftCloseIcon className="size-4" />
            )}
            <span className="sr-only">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </span>
          </Button>
        )}
      </div>

      <div className={collapsed ? "px-2" : "px-3"}>
        <Button
          variant="outline"
          className={cn("w-full gap-2", collapsed ? "justify-center px-0" : "justify-start")}
          onClick={() => setNewProjectOpen(true)}
        >
          <PlusIcon className="size-4" />
          {!collapsed && "New notebook"}
        </Button>
      </div>

      <nav className={cn("mt-4 flex-1 overflow-y-auto", collapsed ? "px-2" : "px-2")}>
        {!collapsed && (
          <p className="px-2 pb-1.5 text-xs font-medium text-muted-foreground">Notebooks</p>
        )}
        <ul className="flex flex-col gap-0.5">
          {projects.map((project) => {
            const isActive = pathname === `/project/${project.id}`;
            if (collapsed) {
              return (
                <li key={project.id}>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Link
                          href={`/project/${project.id}`}
                          className={cn(
                            "flex items-center justify-center rounded-md py-2.5",
                            isActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60"
                          )}
                        />
                      }
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          PROJECT_STATUS_META[project.status].dotClassName
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="right">{project.title}</TooltipContent>
                  </Tooltip>
                </li>
              );
            }
            return (
              <li key={project.id}>
                <Link
                  href={`/project/${project.id}`}
                  className={cn(
                    "flex flex-col gap-1 rounded-md px-2.5 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
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

      <div
        className={cn(
          "flex items-center gap-1 border-t border-sidebar-border px-2 py-2",
          collapsed ? "flex-col justify-center" : "justify-between"
        )}
      >
        <UserMenu collapsed={collapsed} />
        <ThemeToggle />
      </div>

      <NewProjectDialog open={newProjectOpen} onOpenChange={setNewProjectOpen} />
    </div>
  );
}

export function Sidebar({ projects }: { projects: Project[] }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "hidden shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:block",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarBody
          projects={projects}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((current) => !current)}
        />
      </aside>

      {/* Mobile: top bar with a sheet-based drawer */}
      <div className="flex items-center justify-between border-b border-sidebar-border bg-sidebar px-3 py-2.5 md:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" />}>
            <MenuIcon className="size-5" />
            <span className="sr-only">Open navigation</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-sidebar-border p-0">
            <SidebarBody projects={projects} />
          </SheetContent>
        </Sheet>
        <Link href="/dashboard">
          <BrandLockup />
        </Link>
        <ThemeToggle />
      </div>
    </>
  );
}
