import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex flex-col items-center gap-6">
        <span className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-lg font-bold text-zinc-950">
          C
        </span>
        <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
          Scope it before you build it.
        </h1>
        <p className="max-w-md text-balance text-zinc-400">
          CODEPRINT interviews you about your next project, then generates the
          architecture, design, and README docs ready to hand to a coding agent.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Button
            size="lg"
            className="gap-1.5"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            Open dashboard
            <ArrowRightIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href="/sign-in" />}
          >
            Sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
