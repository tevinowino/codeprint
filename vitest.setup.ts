import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement ResizeObserver; components that measure their own
// element (e.g. liquid-gooey) need at least a no-op stub to mount in tests.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
