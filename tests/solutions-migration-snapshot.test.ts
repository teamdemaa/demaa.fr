import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migrationDirectory = resolve(root, "migrations/solutions-v1");
const snapshotPath = resolve(migrationDirectory, "solutions-migration-candidates.json");
const outputManifestPath = resolve(migrationDirectory, "output-manifest.json");
const sourceManifestPath = resolve(migrationDirectory, "source-manifest.json");
const generatorPath = resolve(migrationDirectory, "build-snapshot.mjs");

type Candidate = {
  candidateId: string;
  sourcePlacementReference: string;
  resourceKind: "software" | "provider" | "directory";
  resourceSlug: string;
  sourceDomain: "legacy_tools" | "legacy_ecosystem";
  legacyPlacement: {
    groupSlug?: string;
    rankInGroup?: number;
    globalRank?: number;
    uiRank?: number | null;
    seoRank?: number | null;
  };
  provenance: { kind: string };
  classification: string;
  evidenceStatus: string;
  reviewStatus: "pending";
  commercialRelationship: "unknown";
  recommendedAction: string;
};

type SystemCandidate = {
  systemSlug: string;
  auditFlags: {
    toolsUiEmpty: boolean;
    toolsUiBelowFive: boolean;
    uiSeoMismatch: boolean;
    hasUniversalLegacyResources: boolean;
  };
  candidates: Candidate[];
  unmetNeeds: Array<{
    needId: string;
    needType: "provider";
    resourceSlug: null;
    resourceName: null;
    reviewStatus: "pending";
    commercialRelationship: "unknown";
    recommendedAction: "source_and_verify_provider";
  }>;
};

type Snapshot = {
  sourceCommit: string;
  sourceArtifacts: Array<{ sourceId: string; sha256: string }>;
  policy: {
    publicationMode: "migration_candidates_only";
    reviewStatus: "pending";
    commercialRelationship: "unknown";
    fallbackPolicy: "none";
  };
  summary: Record<string, number>;
  systems: SystemCandidate[];
};

function sha256(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function json<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function expectUnique(values: Array<string | number>) {
  expect(new Set(values).size).toBe(values.length);
}

function filesBelow(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesBelow(path) : [path];
  });
}

const snapshot = json<Snapshot>(snapshotPath);
const allCandidates = snapshot.systems.flatMap((system) => system.candidates);

describe("offline Solutions migration snapshot", () => {
  it("pins the exact W2 inputs and covers all 115 systems", () => {
    const manifest = json<{
      sourceCommit: string;
      sources: Array<{ sourceId: string; file: string; sha256: string }>;
      recordedW2Artifacts: Array<{ artifact: string; sha256: string }>;
    }>(sourceManifestPath);
    expect(manifest.sourceCommit).toBe("4b8a5d77333f7f30d0d649a200a0414b1796a65f");
    expect(snapshot.sourceCommit).toBe(manifest.sourceCommit);
    expect(snapshot.systems).toHaveLength(115);
    expectUnique(snapshot.systems.map((system) => system.systemSlug));

    const expectedSourceHashes = {
      "w2-effective-ecosystem-matrix": "d221b30e165af384fd2d4f0a668077e26b88cf564f20a9894347da1a5ce95f87",
      "w2-effective-ecosystem-summary": "46a4e21c676bf84e57042488035cc049a62cc95a60d2d56185cc2f6652baa461",
      "w2-effective-tools-snapshot": "bb9f7c618b60d092eba743f19628fedb5fec81247cd4bd3a0db07516c069ddf8",
    } as const;
    expect(Object.fromEntries(snapshot.sourceArtifacts.map(({ sourceId, sha256: hash }) => [sourceId, hash])))
      .toEqual(expectedSourceHashes);
    for (const source of manifest.sources) {
      expect(source.sha256).toBe(expectedSourceHashes[source.sourceId as keyof typeof expectedSourceHashes]);
      expect(sha256(readFileSync(resolve(migrationDirectory, source.file)))).toBe(source.sha256);
    }
    expect(Object.fromEntries(manifest.recordedW2Artifacts.map(({ artifact, sha256: hash }) => [artifact, hash])))
      .toMatchObject({
        "tools/report.md": "deabf2da5454d2c1b5d30e15246e07c20c3ac193c3f7c202c93d445af8432a12",
        "tools/snapshot-115.md": "b62cf6e70627d9c120e1630a0388b799eb04b052bffda4fc1d039eca3b666d92",
      });
  });

  it("preserves every audited anomaly as an explicit pending decision", () => {
    expect(snapshot.summary).toMatchObject({
      systemCount: 115,
      systemsWithEmptyToolUi: 4,
      systemsWithFewerThanFiveToolCards: 35,
      systemsWithUiSeoMismatch: 12,
      universalLegacyPlacements: 345,
      legacyServicesToExit: 15,
      excludedConflictCandidates: 1,
      unmetNeedCount: 2,
    });
    expect(snapshot.systems.filter((system) => system.auditFlags.toolsUiEmpty).map((system) => system.systemSlug))
      .toEqual([
        "assistant-administratif-externalise",
        "office-manager-externalise",
        "secretariat-externalise",
        "studio-branding-design",
      ]);
    expect(snapshot.systems.filter((system) => system.auditFlags.uiSeoMismatch).map((system) => system.systemSlug))
      .toEqual([
        "agence-de-recrutement",
        "agence-web",
        "cabinet-davocat",
        "cabinet-de-conseil",
        "coach-professionnel",
        "consultant-independant",
        "creation-de-contenu",
        "freelance",
        "investissement-entreprise",
        "marketplace",
        "media",
        "saas",
      ]);
    for (const system of snapshot.systems.filter((entry) => entry.auditFlags.toolsUiEmpty)) {
      const toolCandidates = system.candidates.filter((candidate) => candidate.sourceDomain === "legacy_tools");
      expect(toolCandidates.length).toBeGreaterThan(0);
      expect(toolCandidates.every((candidate) => candidate.legacyPlacement.uiRank === null)).toBe(true);
      expect(toolCandidates.every((candidate) => candidate.recommendedAction === "review_transverse_scope_mismatch")).toBe(true);
    }
    expect(allCandidates.filter((candidate) => candidate.provenance.kind === "hardcoded_universal"))
      .toHaveLength(345);
    expect(allCandidates.filter((candidate) => (
      candidate.provenance.kind === "hardcoded_universal"
      && candidate.recommendedAction === "review_universal_placement"
    ))).toHaveLength(344);
    expect(allCandidates.filter((candidate) => (
      candidate.provenance.kind === "hardcoded_universal"
      && candidate.recommendedAction === "exclude_conflict"
    ))).toHaveLength(1);
    expect(allCandidates.filter((candidate) => candidate.classification === "service_demaa_legacy"))
      .toHaveLength(15);
    expect(allCandidates.filter((candidate) => candidate.classification === "service_demaa_legacy")
      .every((candidate) => candidate.recommendedAction === "move_to_services_catalog")).toBe(true);
  });

  it("excludes the accounting conflict and records needs without inventing providers", () => {
    const excluded = snapshot.systems.flatMap((system) => system.candidates.map((candidate) => ({
      systemSlug: system.systemSlug,
      ...candidate,
    }))).filter((candidate) => candidate.recommendedAction === "exclude_conflict");
    expect(excluded).toHaveLength(1);
    expect(excluded[0]).toMatchObject({
      systemSlug: "cabinet-comptable",
      resourceSlug: "em2a-expertise",
      classification: "exclude",
      reviewStatus: "pending",
    });

    const needs = snapshot.systems.flatMap((system) => system.unmetNeeds.map((need) => ({
      systemSlug: system.systemSlug,
      ...need,
    })));
    expect(needs.map(({ systemSlug, needId }) => ({ systemSlug, needId }))).toEqual([
      { systemSlug: "batiment", needId: "need:batiment:reponse-appels-offres" },
      { systemSlug: "cabinet-comptable", needId: "need:cabinet-comptable:delegation-juridique" },
    ]);
    expect(needs.every((need) => (
      need.resourceSlug === null
      && need.resourceName === null
      && need.reviewStatus === "pending"
      && need.commercialRelationship === "unknown"
      && need.recommendedAction === "source_and_verify_provider"
    ))).toBe(true);
  });

  it("keeps IDs, source references and legacy ranks unambiguous", () => {
    expectUnique(allCandidates.map((candidate) => candidate.candidateId));
    expectUnique(allCandidates.map((candidate) => candidate.sourcePlacementReference));
    expectUnique(snapshot.systems.flatMap((system) => system.unmetNeeds.map((need) => need.needId)));

    for (const system of snapshot.systems) {
      const ecosystem = system.candidates.filter((candidate) => candidate.sourceDomain === "legacy_ecosystem");
      expectUnique(ecosystem.map((candidate) => candidate.legacyPlacement.globalRank as number));
      const byGroup = Map.groupBy(ecosystem, (candidate) => candidate.legacyPlacement.groupSlug as string);
      for (const groupCandidates of byGroup.values()) {
        expectUnique(groupCandidates.map((candidate) => candidate.legacyPlacement.rankInGroup as number));
      }

      const software = system.candidates.filter((candidate) => candidate.sourceDomain === "legacy_tools");
      expectUnique(software.flatMap((candidate) => candidate.legacyPlacement.uiRank === null ? [] : [candidate.legacyPlacement.uiRank as number]));
      expectUnique(software.flatMap((candidate) => candidate.legacyPlacement.seoRank === null ? [] : [candidate.legacyPlacement.seoRank as number]));
    }
  });

  it("cannot accidentally publish or fall back", () => {
    expect(snapshot.policy).toEqual({
      publicationMode: "migration_candidates_only",
      reviewStatus: "pending",
      commercialRelationship: "unknown",
      fallbackPolicy: "none",
    });
    expect(allCandidates.every((candidate) => (
      ["software", "provider", "directory"].includes(candidate.resourceKind)
      && candidate.reviewStatus === "pending"
      && candidate.commercialRelationship === "unknown"
      && candidate.evidenceStatus.length > 0
    ))).toBe(true);
    const serialized = JSON.stringify(snapshot);
    expect(serialized).not.toContain('"reviewStatus":"approved"');
    expect(serialized).not.toContain('"status":"published"');
    expect([...serialized.matchAll(/"fallbackPolicy"/g)]).toHaveLength(1);
  });

  it("is not reachable from runtime source files", () => {
    const runtimeFiles = filesBelow(resolve(root, "src"))
      .filter((path) => /\.(?:ts|tsx|js|jsx|mjs|json)$/.test(path));
    const forbiddenReferences = [
      "migrations/solutions-v1",
      "solutions-migration-candidates",
      "w2-tools-snapshot",
      "w2-ecosystem-effective-matrix",
    ];
    for (const path of runtimeFiles) {
      const contents = readFileSync(path, "utf8");
      for (const reference of forbiddenReferences) expect(contents).not.toContain(reference);
    }
  });

  it("regenerates byte-identical outputs and verifies the committed hash", () => {
    execFileSync(process.execPath, [generatorPath, "--check"], { cwd: root });
    const first = mkdtempSync(join(tmpdir(), "demaa-w4-first-"));
    const second = mkdtempSync(join(tmpdir(), "demaa-w4-second-"));
    try {
      execFileSync(process.execPath, [generatorPath, "--output-dir", first], { cwd: root });
      execFileSync(process.execPath, [generatorPath, "--output-dir", second], { cwd: root });
      for (const filename of ["solutions-migration-candidates.json", "output-manifest.json"]) {
        expect(readFileSync(resolve(first, filename))).toEqual(readFileSync(resolve(second, filename)));
        expect(readFileSync(resolve(first, filename))).toEqual(readFileSync(resolve(migrationDirectory, filename)));
      }
      const manifest = json<{ snapshotSha256: string }>(outputManifestPath);
      expect(sha256(readFileSync(snapshotPath))).toBe(manifest.snapshotSha256);
    } finally {
      rmSync(first, { recursive: true, force: true });
      rmSync(second, { recursive: true, force: true });
    }
  }, 20_000);
});
