"use client";

import Link from "next/link";
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";
import { Sidebar } from "@/components/shell/sidebar";
import { useProjects } from "@/lib/use-projects";

/**
 * Frame for every signed-in screen. Convex queries reject anonymous callers,
 * so nothing below `Authenticated` renders until Convex has accepted the
 * Clerk session token — otherwise the first query would throw.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthLoading>
        <CenteredMessage>Loading your notebooks…</CenteredMessage>
      </AuthLoading>
      <Unauthenticated>
        <CenteredMessage>
          We couldn&apos;t verify your session.{" "}
          <Link href="/sign-in" className="underline underline-offset-4">
            Sign in again
          </Link>
        </CenteredMessage>
      </Unauthenticated>
      <Authenticated>
        <SignedInFrame>{children}</SignedInFrame>
      </Authenticated>
    </>
  );
}

function SignedInFrame({ children }: { children: React.ReactNode }) {
  const projects = useProjects();

  return (
    <div className="flex h-dvh w-full flex-col md:flex-row">
      <Sidebar projects={projects ?? []} />
      {/*
       * h-full (not min-h-full) + overflow-y-auto makes this the page-level
       * scroll container: routes that fill it exactly (Workspace, via its own
       * h-full/min-h-0 chain down to internal scroll regions) never trigger
       * it, while routes with natural content taller than the viewport
       * (Dashboard) scroll here instead of growing the whole document.
       */}
      <div className="h-full min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh items-center justify-center px-6 text-center text-sm text-muted-foreground">
      <p>{children}</p>
    </div>
  );
}
