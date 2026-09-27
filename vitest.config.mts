import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      // Next.js replaces this with a no-op during its server build; Vitest
      // needs the same substitution since it isn't going through that bundler.
      "server-only": path.resolve(import.meta.dirname, "./vitest.server-only-stub.ts"),
    },
  },
});
