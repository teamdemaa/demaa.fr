import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  unstable_cache: (callback: () => unknown) => callback,
}));

import type { FirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry-contract";
import type { FirebaseToolComparisonDocument } from "@/lib/firebase-tool-comparison-contract";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";

const fingerprint = "a".repeat(64);
const revision = {
  revisionId: "solutions-test-v1",
  sourceFingerprint: fingerprint,
} as FirebaseSolutionRegistryRevision;
const sections: RenderableSolutionSectionDto[] = [{
  section: "software",
  placements: ["outil-a", "outil-b"].map((resourceSlug, index) => ({
    placementId: `test:${resourceSlug}`,
    systemSlug: "test-system",
    rank: index + 1,
    section: "software" as const,
    usage: "Test",
    fitRationale: "Test",
    fitConstraints: [],
    resource: {
      resourceSlug,
      resourceType: "software" as const,
      name: resourceSlug,
      description: "Test",
      interaction: { interactionMode: "external_link" as const, href: "https://example.com" },
    },
  })),
}];

const comparisonDocument: FirebaseToolComparisonDocument = {
  schemaVersion: 2,
  publicationStatus: "published",
  registryRevisionId: revision.revisionId,
  registryFingerprint: fingerprint,
  systemSlug: "test-system",
  expiresAt: "2027-02-28",
  sourceUrls: [
    "https://example.com/source-a",
    "https://example.com/source-b",
  ],
  evidence: [
    {
      evidenceId: "evidence-a",
      resourceSlug: "outil-a",
      sourceRef: "https://example.com/source-a",
      claim: "Outil A documente les fonctions testées.",
      capturedAt: "2026-08-31",
    },
    {
      evidenceId: "evidence-b",
      resourceSlug: "outil-b",
      sourceRef: "https://example.com/source-b",
      claim: "Outil B documente les fonctions testées.",
      capturedAt: "2026-08-31",
    },
  ],
  comparison: {
    systemSlug: "test-system",
    systemName: "Test",
    reviewedAt: "2026-08-31",
    tools: [
      { resourceSlug: "outil-a", name: "Outil A", positioning: "A" },
      { resourceSlug: "outil-b", name: "Outil B", positioning: "B" },
    ],
    features: Array.from({ length: 8 }, (_, index) => ({
      featureId: `feature-${index + 1}`,
      label: `Fonctionnalité ${index + 1}`,
      cells: index < 4
        ? [
            { status: "covered", evidenceIds: ["evidence-a"] },
            { status: "not_documented", evidenceIds: [] },
          ]
        : [
            { status: "covered", evidenceIds: ["evidence-a"] },
            { status: "covered", evidenceIds: ["evidence-b"] },
          ],
    })),
  },
};

let getView: typeof import("@/lib/firebase-tool-comparison.server").getFirebaseToolComparisonViewForRevision;
let validateDocument: typeof import("@/lib/firebase-tool-comparison-contract").validateFirebaseToolComparisonDocument;

beforeAll(async () => {
  ({ getFirebaseToolComparisonViewForRevision: getView } = await import(
    "@/lib/firebase-tool-comparison.server"
  ));
  ({ validateFirebaseToolComparisonDocument: validateDocument } = await import(
    "@/lib/firebase-tool-comparison-contract"
  ));
});

describe("Firebase tool comparisons", () => {
  it("publishes a valid document bound to the exact registry fingerprint", async () => {
    expect(validateDocument(comparisonDocument, {
      registryRevisionId: revision.revisionId,
      registryFingerprint: fingerprint,
      systemSlug: "test-system",
      visibleToolSlugs: ["outil-a", "outil-b"],
      now: new Date("2026-09-01T12:00:00.000Z"),
    })).toEqual([]);

    await expect(getView({
      revision,
      systemSlug: "test-system",
      sections,
      fetchDocument: async () => comparisonDocument,
    })).resolves.toEqual(comparisonDocument.comparison);
  });

  it("fails closed on a stale fingerprint or a tool absent from Firebase", async () => {
    const warn = vi.fn();
    await expect(getView({
      revision,
      systemSlug: "test-system",
      sections,
      fetchDocument: async () => ({
        ...comparisonDocument,
        registryFingerprint: "b".repeat(64),
      }),
      warn,
    })).resolves.toBeNull();
    expect(warn).toHaveBeenCalledOnce();

    expect(validateDocument({
      ...comparisonDocument,
      comparison: {
        ...comparisonDocument.comparison,
        tools: [
          comparisonDocument.comparison.tools[0],
          { resourceSlug: "outil-local", name: "Local", positioning: "Local" },
        ],
      },
    }, {
      registryRevisionId: revision.revisionId,
      registryFingerprint: fingerprint,
      systemSlug: "test-system",
      visibleToolSlugs: ["outil-a", "outil-b"],
      now: new Date("2026-09-01T12:00:00.000Z"),
    })).toContain("outil-local: comparison tool is not visible in the active Firebase revision");
  });

  it("does not expose a comparator when Firebase has no reviewed document", async () => {
    await expect(getView({
      revision,
      systemSlug: "test-system",
      sections,
      fetchDocument: async () => null,
    })).resolves.toBeNull();
  });

  it("keeps a draft comparison private without logging an operational warning", async () => {
    const warn = vi.fn();
    await expect(getView({
      revision,
      systemSlug: "test-system",
      sections,
      fetchDocument: async () => ({
        ...comparisonDocument,
        publicationStatus: "draft",
      }),
      warn,
    })).resolves.toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });

  it("rejects a published positive cell without atomic evidence", () => {
    const firstFeature = comparisonDocument.comparison.features[0];
    expect(validateDocument({
      ...comparisonDocument,
      comparison: {
        ...comparisonDocument.comparison,
        features: [
          {
            ...firstFeature,
            cells: [
              { status: "covered", evidenceIds: [] },
              firstFeature.cells[1],
            ],
          },
          ...comparisonDocument.comparison.features.slice(1),
        ],
      },
    }, {
      registryRevisionId: revision.revisionId,
      registryFingerprint: fingerprint,
      systemSlug: "test-system",
      visibleToolSlugs: ["outil-a", "outil-b"],
      now: new Date("2026-09-01T12:00:00.000Z"),
    })).toContain("outil-a/feature-1: documented cell has no atomic evidence");
  });
});
