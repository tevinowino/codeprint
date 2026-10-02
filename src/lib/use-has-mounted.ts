"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True only after the client has hydrated. Use this instead of the classic
 * `useEffect(() => setMounted(true), [])` guard — that pattern calls
 * setState synchronously inside an effect purely to react to a value that
 * can never change after mount, which is exactly what `useSyncExternalStore`
 * is for: the server snapshot is `false`, the client snapshot is `true`, no
 * extra render-triggering effect required.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
