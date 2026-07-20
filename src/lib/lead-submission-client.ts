import "client-only";

const STORAGE_PREFIX = "demaa-lead-submission:";

function normalizeFlowKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9:_-]+/g, "-").slice(0, 100);
}

export function getLeadSubmissionKey(flowKey: string) {
  const storageKey = `${STORAGE_PREFIX}${normalizeFlowKey(flowKey)}`;
  const existing = window.sessionStorage.getItem(storageKey);
  if (existing) return existing;

  const id = typeof window.crypto.randomUUID === "function"
    ? window.crypto.randomUUID()
    : `${Date.now()}-${window.crypto.getRandomValues(new Uint32Array(2)).join("-")}`;
  const value = `web:${normalizeFlowKey(flowKey)}:${id}`;
  window.sessionStorage.setItem(storageKey, value);
  return value;
}

export function clearLeadSubmissionKey(flowKey: string) {
  window.sessionStorage.removeItem(
    `${STORAGE_PREFIX}${normalizeFlowKey(flowKey)}`,
  );
}
