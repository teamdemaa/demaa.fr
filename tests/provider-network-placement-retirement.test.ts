import { describe, expect, it } from "vitest";

import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  buildRetiredPlacementMigrationPlan,
  buildRetiredPlacementSnapshot,
  expectedRetiredUniversalPlacementIds,
  parseRetiredPlacementSnapshot,
} from "@/lib/provider-network-placement-retirement";

function legacyPlacement(systemSlug: string) {
  return {
    expertisePlacementId: `${systemSlug}:chartered-accountant`,
    expertiseId: "chartered-accountant",
    systemSlug,
    rank: 1,
    usage: "Confier votre comptabilité et vos obligations à un professionnel adapté à votre activité.",
    fitRationale: "Le besoin dépend du contexte de l’entreprise.",
    fitConstraints: ["Vérifier l’inscription professionnelle."],
    displayCategory: "Prestation réglementée",
    nameOverride: "Expert-comptable",
    descriptionOverride: "Un professionnel pour suivre la comptabilité.",
    visibility: "selected",
    placementVersion: "1.0.0",
  };
}

describe("universal accountant placement retirement", () => {
  const placements = enterpriseCatalog
    .filter(({ slug }) => slug !== "cabinet-comptable")
    .map(({ slug }) => legacyPlacement(slug));
  const snapshot = buildRetiredPlacementSnapshot({
    projectId: "demaa-dde32",
    capturedAt: "2026-08-09T12:00:00.000Z",
    placements,
  });

  it("covers exactly the 114 non-accounting systems", () => {
    expect(expectedRetiredUniversalPlacementIds()).toHaveLength(114);
    expect(snapshot.documents).toHaveLength(114);
    expect(snapshot.documents.some(({ data }) =>
      data.systemSlug === "cabinet-comptable"
    )).toBe(false);
  });

  it("creates exact delete and rollback plans from the same sealed snapshot", () => {
    const plan = buildRetiredPlacementMigrationPlan(snapshot);
    expect(plan.deletes).toHaveLength(114);
    expect(plan.rollbackWrites).toEqual(snapshot.documents);
    expect(plan.snapshotFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(parseRetiredPlacementSnapshot(JSON.parse(JSON.stringify(snapshot))))
      .toEqual(snapshot);
  });

  it("refuses partial snapshots and modified rollback data", () => {
    expect(() => buildRetiredPlacementSnapshot({
      projectId: "demaa-dde32",
      capturedAt: "2026-08-09T12:00:00.000Z",
      placements: placements.slice(1),
    })).toThrow("exactement les 114");
    expect(() => parseRetiredPlacementSnapshot({
      ...snapshot,
      snapshotFingerprint: "0".repeat(64),
    })).toThrow("fingerprint");
  });
});
