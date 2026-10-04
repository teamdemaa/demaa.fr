"use client";

import { useMemo, useSyncExternalStore } from "react";

/** Subscribe to browser state after hydration without effect-driven React state. */
class BrowserSnapshotStore<T> {
  private snapshot: T | undefined;
  constructor(private readonly read: () => T) {}
  getSnapshot = () => this.snapshot;
  subscribe = (notify: () => void) => {
    const refresh = () => { this.snapshot = this.read(); notify(); };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("popstate", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("popstate", refresh);
    };
  };
}

export function useBrowserSnapshot<T>(read: () => T): T | undefined {
  const store = useMemo(() => new BrowserSnapshotStore(read), [read]);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => undefined);
}
