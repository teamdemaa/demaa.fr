import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  loadAdminToolRegistryReadModel,
} from "@/lib/admin-tool-registry.server";
import { parseFirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry-contract";
import snapshot from "@/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json";

function source(path: string) {
  return readFileSync(path, "utf8");
}

const revision = parseFirebaseSolutionRegistryRevision(snapshot);

describe("admin tool registry read model", () => {
  it("exposes all 115 systems from a valid active revision without mutating it", async () => {
    const model = await loadAdminToolRegistryReadModel({
      candidateRevisionId: null,
      fetchActive: async () => revision,
      now: new Date("2026-08-24T08:00:00.000Z"),
    });

    expect(model.status).toBe("ready");
    if (model.status !== "ready") return;
    expect(model.active.revisionId).toBe(revision.revisionId);
    expect(model.candidate).toBeNull();
    expect(model.systems).toHaveLength(115);
    expect(model.systems.every(({ activeTools }) =>
      activeTools.every((tool, index) => tool.rank === index + 1)
    )).toBe(true);
  });

  it("loads an explicitly configured candidate and computes a neutral diff", async () => {
    const model = await loadAdminToolRegistryReadModel({
      candidateRevisionId: revision.revisionId,
      fetchActive: async () => revision,
      fetchCandidate: async () => revision,
      now: new Date("2026-08-24T08:00:00.000Z"),
    });

    expect(model.status).toBe("ready");
    if (model.status !== "ready") return;
    expect(model.candidate?.revisionId).toBe(revision.revisionId);
    expect(model.systems.every(({ addedResourceSlugs, removedResourceSlugs }) =>
      addedResourceSlugs.length === 0 && removedResourceSlugs.length === 0
    )).toBe(true);
  });

  it("fails closed when the active Firebase revision cannot be loaded", async () => {
    const warn = vi.fn();
    const model = await loadAdminToolRegistryReadModel({
      candidateRevisionId: null,
      fetchActive: async () => {
        throw new Error("firebase unavailable");
      },
      warn,
    });

    expect(model).toEqual({
      status: "unavailable",
      error: "La révision active des Outils est indisponible. Aucun fallback local n'est affiché.",
    });
    expect(warn).toHaveBeenCalledOnce();
  });

  it("keeps the admin page private and read-only", () => {
    const page = source("src/app/(administration)/admin/outils/page.tsx");
    expect(page).toContain('robots: { follow: false, index: false }');
    expect(page).toContain('requireAdminIdentity("/admin/outils")');
    expect(page).toContain("Vue Team en lecture seule");
    expect(page).not.toContain("fetch(");
    expect(page).not.toContain("method=\"post\"");
  });
});
