import "client-only";

import {
  safeReadBrowserStorage,
  safeRemoveBrowserStorage,
  safeWriteBrowserStorage,
} from "@/lib/browser-storage";

const STORAGE_PREFIX = "demaa-lead-submission:";
const memorySubmissionKeys = new Map<string, string>();

function normalizeFlowKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9:_-]+/g, "-").slice(0, 100);
}

export function getLeadSubmissionKey(flowKey: string) {
  const storageKey = `${STORAGE_PREFIX}${normalizeFlowKey(flowKey)}`;
  const existing = safeReadBrowserStorage(() => window.sessionStorage, storageKey)
    ?? memorySubmissionKeys.get(storageKey);
  if (existing) return existing;

  let id: string;
  try {
    id = typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now()}-${window.crypto.getRandomValues(new Uint32Array(2)).join("-")}`;
  } catch {
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  const value = `web:${normalizeFlowKey(flowKey)}:${id}`;
  memorySubmissionKeys.set(storageKey, value);
  safeWriteBrowserStorage(() => window.sessionStorage, storageKey, value);
  return value;
}

export function clearLeadSubmissionKey(flowKey: string) {
  const storageKey = `${STORAGE_PREFIX}${normalizeFlowKey(flowKey)}`;
  memorySubmissionKeys.delete(storageKey);
  safeRemoveBrowserStorage(() => window.sessionStorage, storageKey);
}
