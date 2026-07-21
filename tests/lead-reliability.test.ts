import { describe, expect, it } from "vitest";
import { buildLeadIdempotencyHash } from "../src/lib/lead-idempotency";
import { chunkSlackLines } from "../src/lib/lead-notification-format";
import { getLeadRetryDelayMs } from "../src/lib/lead-retry";
import {
  safeReadBrowserStorage,
  safeRemoveBrowserStorage,
  safeWriteBrowserStorage,
} from "../src/lib/browser-storage";

describe("lead reliability", () => {
  it("builds stable, request-scoped Firestore identifiers", () => {
    const first = buildLeadIdempotencyHash("system_kit_request", "web:test:12345678");
    const retry = buildLeadIdempotencyHash("system_kit_request", "web:test:12345678");
    const otherFlow = buildLeadIdempotencyHash("service_introduction", "web:test:12345678");

    expect(first).toBe(retry);
    expect(first).toHaveLength(64);
    expect(first).not.toBe(otherFlow);
  });

  it("keeps every Slack section below the configured limit", () => {
    const sections = chunkSlackLines([
      "Titre",
      `Besoin : ${"a".repeat(2800)}`,
      `Attribution : ${"b".repeat(900)}`,
    ]);

    expect(sections.length).toBeGreaterThan(1);
    expect(sections.every((section) => section.length <= 2900)).toBe(true);
  });

  it("falls back cleanly when browser storage is blocked", () => {
    const blockedStorage = () => {
      throw new DOMException("Storage blocked", "SecurityError");
    };

    expect(safeReadBrowserStorage(blockedStorage, "lead")).toBeNull();
    expect(safeWriteBrowserStorage(blockedStorage, "lead", "value")).toBe(false);
    expect(safeRemoveBrowserStorage(blockedStorage, "lead")).toBe(false);
  });

  it("uses an exponential retry delay capped at 24 hours", () => {
    expect(getLeadRetryDelayMs(1)).toBe(15 * 60 * 1000);
    expect(getLeadRetryDelayMs(2)).toBe(30 * 60 * 1000);
    expect(getLeadRetryDelayMs(20)).toBe(24 * 60 * 60 * 1000);
  });
});
