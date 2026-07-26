import { describe, expect, it } from "vitest";
import {
  generateRealEstateExpertiseCoreDraft, generateRealEstateExpertiseDraft, realEstateExpertiseProfiles,
} from "@/lib/real-estate-expertise-process-industrialization";
import { auditProcessDraft, operationalContentTypes } from "@/lib/process-industrialization";

describe("industrialisation Process Immobilier expertise", () => {
  const profiles = Object.values(realEstateExpertiseProfiles);
  const core = generateRealEstateExpertiseCoreDraft();
  const coreLabels = Object.values(core.contentByProcessId).flat().map((x) => x.label);
  it("couvre les trois métiers", () => {
    expect(profiles.map((x) => x.slug).sort()).toEqual(["architecte-maitre-oeuvre", "diagnostiqueur-immobilier", "geometre"]);
  });
  it("produit 14 processus, 74 contenus uniques et quatre types", () => {
    const audit = auditProcessDraft(core, { processCount: 14, contentCount: 74 });
    expect(audit.errors).toEqual([]);
    expect(audit.contentTypes.sort()).toEqual([...operationalContentTypes].sort());
    expect(new Set(coreLabels).size).toBe(74);
  });
  it.each(profiles)("$name est concret et sourcé", (profile) => {
    const draft = generateRealEstateExpertiseDraft(profile);
    const audit = auditProcessDraft(draft, { processCount: 14, contentCount: 74 });
    const labels = Object.values(draft.contentByProcessId).flat().map((x) => x.label);
    expect(audit.errors).toEqual([]);
    expect(labels.filter((x, i) => x !== coreLabels[i])).toHaveLength(16);
    expect(new Set(labels).size).toBe(74);
    expect(profile.researchSources.length).toBeGreaterThanOrEqual(4);
    expect(labels.some((x) => /support associé|à personnaliser|modèle à préparer/i.test(x))).toBe(false);
  });
  it("nomme les opérations distinctives", () => {
    const text = (slug: keyof typeof realEstateExpertiseProfiles) => Object.values(
      generateRealEstateExpertiseDraft(realEstateExpertiseProfiles[slug]).contentByProcessId,
    ).flat().map((x) => x.label).join(" ");
    expect(text("architecte-maitre-oeuvre")).toMatch(/DOE/i);
    expect(text("diagnostiqueur-immobilier")).toMatch(/Ademe/i);
    expect(text("geometre")).toMatch(/GNSS/i);
  });
});
