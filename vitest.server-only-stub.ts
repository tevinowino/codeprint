// Test-environment stand-in for the "server-only" package. Next.js swaps
// that package for a no-op in its own server build; Vitest needs the same
// substitution since tests run outside Next's bundler (see vitest.config.ts).
export {};
