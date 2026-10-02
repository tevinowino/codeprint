import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/brand-lockup";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProductPreview } from "@/components/landing/product-preview";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Vercel-brief's "subtle glow": a single soft, monochrome light source, not decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-140 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,var(--foreground),transparent)]/8"
      />

      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/">
          <BrandLockup />
        </Link>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" nativeButton={false} render={<Link href="/sign-in" />}>
            Sign in
          </Button>
          <Button nativeButton={false} render={<Link href="/dashboard" />}>
            Open dashboard
          </Button>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-16 px-6 py-12 lg:flex-row lg:items-start lg:gap-12 lg:pt-28 lg:pb-20">
        <div className="flex max-w-xl flex-col items-start gap-6 text-left">
          <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            Scope it before you build it.
          </h1>
          <p className="text-balance text-lg text-muted-foreground">
            CODEPRINT interviews you about your next project, then hands you
            architecture, design, and README docs ready for a coding agent —
            before a single file exists.
          </p>
          <Button
            size="lg"
            className="mt-2 gap-1.5"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            Open dashboard
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>

        <div className="flex w-full justify-center pt-4 lg:w-auto lg:justify-end lg:pt-0 lg:pb-8">
          <ProductPreview />
        </div>
      </main>
    </div>
  );
}
