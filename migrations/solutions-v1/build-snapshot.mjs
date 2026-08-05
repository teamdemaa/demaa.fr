import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const migrationDirectory = dirname(fileURLToPath(import.meta.url));
const snapshotFilename = "solutions-migration-candidates.json";
const outputManifestFilename = "output-manifest.json";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function compareStrings(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function verifySources(manifest) {
  const loaded = new Map();
  for (const source of manifest.sources) {
    const path = resolve(migrationDirectory, source.file);
    const bytes = await readFile(path);
    const actual = sha256(bytes);
    if (actual !== source.sha256) {
      throw new Error(`${source.sourceId}: source hash mismatch (${actual})`);
    }
    loaded.set(source.sourceId, JSON.parse(bytes.toString("utf8")));
  }
  return loaded;
}

function targetKind(entry) {
  if (entry.classification === "software_candidate") return "software";
  if (entry.classification === "directory_only") return "directory";
  if (["finance", "network", "recruitment", "training"].includes(entry.resourceType)) {
    return "directory";
  }
  return "provider";
}

function ecosystemAction(entry) {
  if (entry.classification === "service_demaa_legacy") return "move_to_services_catalog";
  if (entry.classification === "exclude") return "exclude_conflict";
  if (entry.provenanceKind === "hardcoded_universal") return "review_universal_placement";
  if (entry.classification === "directory_only") return "review_directory_fit";
  if (entry.classification === "provider_candidate") return "verify_provider_and_fit";
  if (entry.classification === "software_candidate") return "reconcile_with_tool_registry";
  return "gather_placement_evidence";
}

function ecosystemCandidate(entry) {
  return {
    candidateId: `ecosystem:${entry.systemSlug}:${entry.groupSlug}:${entry.resourceType}:${entry.resourceSlug}`,
    sourcePlacementReference: `ecosystem:${entry.systemSlug}:${entry.groupSlug}:${entry.visibleRankInGroup}`,
    resourceKind: targetKind(entry),
    resourceSlug: entry.resourceSlug,
    resourceName: entry.resourceName,
    sourceDomain: "legacy_ecosystem",
    legacyPlacement: {
      groupSlug: entry.groupSlug,
      groupTitle: entry.groupTitle,
      groupRank: entry.groupRank,
      rankInGroup: entry.visibleRankInGroup,
      globalRank: entry.globalVisibleRank,
      sourceRankBeforeBuilder: entry.sourceRankBeforeBuilder,
    },
    provenance: {
      kind: entry.provenanceKind,
      reference: entry.provenanceRef,
      module: entry.sourceModule,
      builderTransform: entry.builderTransform,
    },
    classification: entry.classification,
    classificationReason: entry.classificationReason,
    evidenceStatus: entry.evidenceStatus,
    reviewStatus: "pending",
    commercialRelationship: "unknown",
    recommendedAction: ecosystemAction(entry),
  };
}

function toolsAction({ uiRank, system, tool }) {
  if (uiRank === null) return "review_transverse_scope_mismatch";
  if (system.uiSeoMismatch) return "reconcile_ui_seo_selection";
  if (!tool.sources?.length || !tool.lastReviewedAt) return "gather_software_evidence";
  return "review_software_fit";
}

function softwareCandidates(system) {
  const bySlug = new Map();
  for (const [surface, entries] of [
    ["ui", system.uiVisible],
    ["seo", system.seoVisible],
  ]) {
    entries.forEach((tool, index) => {
      const current = bySlug.get(tool.slug) ?? { tool, uiRank: null, seoRank: null };
      current[`${surface}Rank`] = index + 1;
      bySlug.set(tool.slug, current);
    });
  }
  return [...bySlug.values()].map(({ tool, uiRank, seoRank }) => ({
    candidateId: `tools:${system.slug}:${tool.slug}`,
    sourcePlacementReference: `tools:${system.slug}:${tool.slug}`,
    resourceKind: "software",
    resourceSlug: tool.slug,
    resourceName: tool.name,
    sourceDomain: "legacy_tools",
    legacyPlacement: {
      uiRank,
      seoRank,
      refIndex: tool.refIndex,
      recommended: tool.recommended,
      scope: tool.scope,
    },
    provenance: {
      kind: system.selection.recommendationSource,
      reference: tool.refSlug,
      module: system.selection.recommendationSource === "enterprise-explicit"
        ? "enterprise-annuaire.json"
        : "system-tool-recommendations.ts",
      directorySource: tool.directorySource,
    },
    classification: uiRank === null ? "ui_filtered_transverse" : "software_candidate",
    classificationReason: uiRank === null
      ? "Présent dans la sélection SEO mais filtré de l'interface par le scope transverse."
      : "Outil effectivement visible dans l'interface historique.",
    evidenceStatus: tool.sources?.length && tool.lastReviewedAt
      ? "product_evidence_only_no_placement_evidence"
      : "missing_product_evidence",
    reviewStatus: "pending",
    commercialRelationship: "unknown",
    recommendedAction: toolsAction({ uiRank, system, tool }),
  }));
}

const unmetNeeds = new Map([
  ["cabinet-comptable", [{
    needId: "need:cabinet-comptable:delegation-juridique",
    needType: "provider",
    label: "Délégation juridique pour le cabinet",
    description: "Identifier un prestataire de sous-traitance juridique compatible avec la relation du cabinet.",
    resourceSlug: null,
    resourceName: null,
    reviewStatus: "pending",
    commercialRelationship: "unknown",
    recommendedAction: "source_and_verify_provider",
  }]],
  ["batiment", [{
    needId: "need:batiment:reponse-appels-offres",
    needType: "provider",
    label: "Réponse aux appels d'offres",
    description: "Identifier un prestataire capable d'accompagner la préparation des réponses aux appels d'offres.",
    resourceSlug: null,
    resourceName: null,
    reviewStatus: "pending",
    commercialRelationship: "unknown",
    recommendedAction: "source_and_verify_provider",
  }]],
]);

function buildSnapshot({ sourceManifest, ecosystemMatrix, ecosystemSummary, toolsSnapshot }) {
  if (ecosystemSummary.systemCount !== 115 || toolsSnapshot.summary.systemCount !== 115) {
    throw new Error("W2 sources must both cover exactly 115 systems");
  }
  if (ecosystemSummary.sourceCommit !== sourceManifest.sourceCommit || toolsSnapshot.summary.commit !== sourceManifest.sourceCommit) {
    throw new Error("W2 source commit mismatch");
  }

  const ecosystemBySystem = new Map();
  for (const entry of ecosystemMatrix) {
    const list = ecosystemBySystem.get(entry.systemSlug) ?? [];
    list.push(ecosystemCandidate(entry));
    ecosystemBySystem.set(entry.systemSlug, list);
  }

  const systems = toolsSnapshot.systems.map((system) => {
    const candidates = [
      ...softwareCandidates(system),
      ...(ecosystemBySystem.get(system.slug) ?? []),
    ].sort((left, right) => compareStrings(left.candidateId, right.candidateId));
    return {
      systemSlug: system.slug,
      systemName: system.name,
      auditFlags: {
        toolsUiEmpty: system.uiVisible.length === 0,
        toolsUiBelowFive: system.uiVisible.length < 5,
        uiSeoMismatch: system.uiSeoMismatch,
        hasUniversalLegacyResources: candidates.some(
          (candidate) => candidate.sourceDomain === "legacy_ecosystem" && candidate.provenance.kind === "hardcoded_universal",
        ),
      },
      candidates,
      unmetNeeds: unmetNeeds.get(system.slug) ?? [],
    };
  }).sort((left, right) => compareStrings(left.systemSlug, right.systemSlug));

  const allCandidates = systems.flatMap((system) => system.candidates);
  return {
    schemaVersion: 1,
    migrationId: sourceManifest.migrationId,
    sourceCommit: sourceManifest.sourceCommit,
    sourceArtifacts: sourceManifest.sources.map(({ sourceId, sha256 }) => ({ sourceId, sha256 })),
    policy: {
      publicationMode: "migration_candidates_only",
      reviewStatus: "pending",
      commercialRelationship: "unknown",
      fallbackPolicy: "none",
    },
    summary: {
      systemCount: systems.length,
      candidateCount: allCandidates.length,
      softwareCandidates: allCandidates.filter((candidate) => candidate.resourceKind === "software").length,
      providerCandidates: allCandidates.filter((candidate) => candidate.resourceKind === "provider").length,
      directoryCandidates: allCandidates.filter((candidate) => candidate.resourceKind === "directory").length,
      systemsWithEmptyToolUi: systems.filter((system) => system.auditFlags.toolsUiEmpty).length,
      systemsWithFewerThanFiveToolCards: systems.filter((system) => system.auditFlags.toolsUiBelowFive).length,
      systemsWithUiSeoMismatch: systems.filter((system) => system.auditFlags.uiSeoMismatch).length,
      universalLegacyPlacements: allCandidates.filter(
        (candidate) => candidate.sourceDomain === "legacy_ecosystem" && candidate.provenance.kind === "hardcoded_universal",
      ).length,
      legacyServicesToExit: allCandidates.filter((candidate) => candidate.classification === "service_demaa_legacy").length,
      excludedConflictCandidates: allCandidates.filter((candidate) => candidate.recommendedAction === "exclude_conflict").length,
      unmetNeedCount: systems.reduce((count, system) => count + system.unmetNeeds.length, 0),
    },
    systems,
  };
}

async function render() {
  const sourceManifest = await readJson(resolve(migrationDirectory, "source-manifest.json"));
  const sources = await verifySources(sourceManifest);
  const snapshot = buildSnapshot({
    sourceManifest,
    ecosystemMatrix: sources.get("w2-effective-ecosystem-matrix"),
    ecosystemSummary: sources.get("w2-effective-ecosystem-summary"),
    toolsSnapshot: sources.get("w2-effective-tools-snapshot"),
  });
  const snapshotText = stableJson(snapshot);
  const outputManifest = {
    schemaVersion: 1,
    migrationId: sourceManifest.migrationId,
    snapshotFile: snapshotFilename,
    snapshotSha256: sha256(snapshotText),
    sourceCommit: sourceManifest.sourceCommit,
    ...snapshot.summary,
  };
  return { snapshotText, outputManifestText: stableJson(outputManifest) };
}

async function main() {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const outputIndex = args.indexOf("--output-dir");
  if (check && outputIndex !== -1) throw new Error("--check and --output-dir are mutually exclusive");
  const outputDirectory = outputIndex === -1
    ? migrationDirectory
    : resolve(process.cwd(), args[outputIndex + 1] ?? "");
  if (outputIndex !== -1 && !args[outputIndex + 1]) throw new Error("--output-dir requires a path");

  const rendered = await render();
  if (check) {
    const [snapshot, manifest] = await Promise.all([
      readFile(resolve(migrationDirectory, snapshotFilename), "utf8"),
      readFile(resolve(migrationDirectory, outputManifestFilename), "utf8"),
    ]);
    if (snapshot !== rendered.snapshotText || manifest !== rendered.outputManifestText) {
      throw new Error("Committed migration outputs are stale");
    }
    process.stdout.write("W4 Solutions migration snapshot is reproducible.\n");
    return;
  }

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(resolve(outputDirectory, snapshotFilename), rendered.snapshotText),
    writeFile(resolve(outputDirectory, outputManifestFilename), rendered.outputManifestText),
  ]);
  process.stdout.write(`${resolve(outputDirectory, snapshotFilename)}\n`);
}

await main();
