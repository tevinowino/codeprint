import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Static placeholder screen — wired to Convex Auth in a later phase.
export default function SignInPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Link href="/" className="flex size-9 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-zinc-950">
            C
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Sign in to CODEPRINT</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Scope your next project in minutes.
            </p>
          </div>
        </div>

        <Button variant="outline" className="border-zinc-800 bg-transparent text-zinc-200 hover:bg-zinc-900">
          Continue with GitHub
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-xs text-zinc-600">or</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <form className="flex flex-col gap-3">
          <Input type="email" placeholder="you@example.com" />
          <Button type="submit">Continue with email</Button>
        </form>

        <p className="text-center text-xs text-zinc-600">
          By continuing, you agree to CODEPRINT&apos;s Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
