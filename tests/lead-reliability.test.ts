import { describe, expect, it } from "vitest";
import { buildLeadIdempotencyHash } from "../src/lib/lead-idempotency";
import { chunkSlackLines } from "../src/lib/lead-notification-format";

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
});
