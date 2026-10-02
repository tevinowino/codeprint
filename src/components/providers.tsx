"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeProvider, useTheme } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GooeyToaster } from "@/components/ui/goey-toaster";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <GooeyToaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-right"
      // "smooth" trades the library's default bounce for restraint, matching the rest of the UI's motion.
      preset="smooth"
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <TooltipProvider delay={200}>
          {children}
          <ThemedToaster />
        </TooltipProvider>
      </ConvexProviderWithClerk>
    </ThemeProvider>
  );
}
