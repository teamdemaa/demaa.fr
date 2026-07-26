import { describe, expect, it } from "vitest";
import {
  btpFamilyCoreDraft,
  btpTradeProfiles,
  generateBtpTradeProcessDraft,
} from "@/lib/btp-process-industrialization";
import {
  auditProcessDraft,
  composeProcessDraft,
} from "@/lib/process-industrialization";
import processRegistry from "@/lib/process-registry.generated.json";

const plumbingOnlyTerms =
  /plomberie|chauffe-eau|chaudière|détartrage|sanitaire|salle de bain|remise en eau|qualifications gaz/i;

function countContentDifferencesFromBtpCore(
  draft: ReturnType<typeof generateBtpTradeProcessDraft>,
) {
  return Object.entries(draft.contentByProcessId).reduce(
    (differenceCount, [processId, items]) =>
      differenceCount +
      items.filter(
        (item, index) =>
          item.label !==
          btpFamilyCoreDraft.contentByProcessId[processId]?.[index]?.label,
      ).length,
    0,
  );
}

describe("process industrialization", () => {
  it("couvre tous les métiers BTP hors pilote Plomberie", () => {
    const btpFamily = processRegistry.families.find(
      (family) => family.familyId === "famille.btp",
    );
    const expectedProfileSlugs = btpFamily?.slugs
      .split(",")
      .map((slug) => slug.trim())
      .filter((slug) => slug !== "plomberie-chauffage")
      .sort();

    expect(btpFamily).toBeDefined();
    expect(Object.keys(btpTradeProfiles).sort()).toEqual(expectedProfileSlugs);
  });

  it("produit un socle BTP complet sans vocabulaire réservé à la plomberie", () => {
    const audit = auditProcessDraft(btpFamilyCoreDraft, {
      contentCount: 74,
      processCount: 18,
    });
    const labels = Object.values(btpFamilyCoreDraft.contentByProcessId)
      .flat()
      .map((item) => item.label)
      .join(" ");

    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes).toHaveLength(4);
    expect(labels).not.toMatch(plumbingOnlyTerms);
  });

  it.each(Object.values(btpTradeProfiles))(
    "génère 18 processus et 74 contenus pour $name",
    (profile) => {
      const draft = generateBtpTradeProcessDraft(profile);
      const audit = auditProcessDraft(draft, {
        contentCount: 74,
        processCount: 18,
      });
      const labels = Object.values(draft.contentByProcessId)
        .flat()
        .map((item) => item.label)
        .join(" ");

      expect(audit.errors).toEqual([]);
      expect(audit.definitionCount).toBe(18);
      expect(audit.contentTypes).toHaveLength(4);
      expect(labels).not.toMatch(plumbingOnlyTerms);
      expect(labels).not.toMatch(
        /mettre en place et tenir à jour le support associé/i,
      );
      expect(labels).toContain(profile.localSearches);
      expect(labels).toContain(profile.commissioningChecks);
      expect(labels).toContain(profile.criticalStock);
      expect(countContentDifferencesFromBtpCore(draft)).toBeGreaterThanOrEqual(
        profile.reviewState === "internal_review_complete" ? 19 : 11,
      );
    },
  );

  it("marque toute la famille BTP hors pilote comme relue en interne", () => {
    expect(
      Object.values(btpTradeProfiles)
        .filter(
          (profile) => profile.reviewState === "internal_review_complete",
        )
        .map((profile) => profile.slug)
        .sort(),
    ).toEqual(Object.keys(btpTradeProfiles).sort());
  });

  it("refuse une couche qui cible un contenu inexistant", () => {
    expect(() =>
      composeProcessDraft(btpFamilyCoreDraft, [
        {
          id: "metier.invalide",
          contentPatches: [
            {
              processId:
                "process.btp.direction.savoir-ou-va-lentreprise",
              contentIndex: 99,
              label: "Ne doit pas être appliqué",
            },
          ],
        },
      ]),
    ).toThrow("contenu 99 absent");
  });

  it("signale une définition opérationnelle incomplète", () => {
    const invalidDraft = generateBtpTradeProcessDraft(
      btpTradeProfiles["renovation-interieur"],
    );
    invalidDraft.definitionsById[
      "process.btp.direction.savoir-ou-va-lentreprise"
    ].objective = " ";

    expect(
      auditProcessDraft(invalidDraft, {
        contentCount: 74,
        processCount: 18,
      }).errors,
    ).toContain(
      "Définition vide (objective) pour process.btp.direction.savoir-ou-va-lentreprise.",
    );
  });
});
