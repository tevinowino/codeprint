import Link from "next/link";
import { BrandLockup } from "@/components/brand-lockup";

/** Centered frame shared by the sign-in and sign-up pages. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <Link href="/">
        <BrandLockup size="md" />
      </Link>
      {children}
    </div>
  );
}
