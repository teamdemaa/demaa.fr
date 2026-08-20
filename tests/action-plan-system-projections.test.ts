import { describe, expect, it } from "vitest";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import {
  getActionPlanGenerationContext,
  getActionPlanSystemOptionsForContext,
} from "@/lib/action-plan-localization";
import {
  englishActionPlanSystemOptions,
  englishActionPlanSystemProjections,
} from "@/lib/action-plan-system-projections";
import rawProcessRegistry from "@/lib/process-registry.generated.json";

type ProcessRegistryPayload = {
  families: Array<{ familyId: string }>;
  métiers: Array<{
    active: boolean;
    familyId: string;
    métierId: string;
    slug: string;
  }>;
};

const processRegistry = rawProcessRegistry as ProcessRegistryPayload;

describe("canonical Action Plan system projections", () => {
  it("keeps one exact set of 115 persisted system IDs in French and English", () => {
    const canonicalIds = actionPlanSystemOptions.map(({ id }) => id);
    const englishIds = englishActionPlanSystemOptions.map(({ id }) => id);

    expect(canonicalIds).toHaveLength(115);
    expect(new Set(canonicalIds).size).toBe(115);
    expect(englishIds).toEqual(canonicalIds);
    expect(englishIds.every((id) => !id.startsWith("en-"))).toBe(true);
  });

  it("publishes one complete English projection for every canonical system", () => {
    expect(englishActionPlanSystemProjections).toHaveLength(115);
    expect(
      englishActionPlanSystemProjections.every(
        ({ content, contentVersion, publicationStatus, systemId }) =>
          systemId.length > 0
          && publicationStatus === "published"
          && contentVersion.length > 0
          && content.label.trim().length > 0
          && content.aliases.length > 0
          && content.aliases.every((alias) => alias.trim().length > 0),
      ),
    ).toBe(true);
  });

  it("keeps the existing 37-family process registry aligned with all systems", () => {
    const canonicalIds = new Set(actionPlanSystemOptions.map(({ id }) => id));
    const activeMétiers = processRegistry.métiers.filter(({ active }) => active);
    const familyIds = new Set(
      processRegistry.families.map(({ familyId }) => familyId),
    );

    expect(activeMétiers).toHaveLength(115);
    expect(familyIds.size).toBe(37);
    expect(new Set(activeMétiers.map(({ slug }) => slug))).toEqual(canonicalIds);
    expect(
      activeMétiers.every(
        ({ familyId, métierId, slug }) =>
          métierId === `metier.${slug}` && familyIds.has(familyId),
      ),
    ).toBe(true);
  });

  it("uses the same English catalogue in France and the global beta market", () => {
    const englishInFrance = getActionPlanSystemOptionsForContext({
      contentLocaleCode: "en",
      marketCodeAtCreation: "fr-fr",
    });
    const englishInGlobalBeta = getActionPlanSystemOptionsForContext({
      contentLocaleCode: "en",
      marketCodeAtCreation: "global-en-beta",
    });

    expect(englishInFrance).toEqual(englishInGlobalBeta);
    expect(englishInFrance).toHaveLength(115);
    expect(
      getActionPlanGenerationContext({
        contentLocaleCode: "en",
        marketCodeAtCreation: "fr-fr",
      }).supportedSystemIds,
    ).toEqual(englishInFrance.map(({ id }) => id));
  });
});
