import { describe, expect, it } from "vitest";

import {
  buildExpectedSolutionOrders,
  collectSerializedSolutionSlugs,
  getSerializedSolutionPayload,
  getExpectedCallTexts,
  loadCanonicalServiceSlugs,
  getTabs,
  loadEnterprises,
} from "../scripts/audit-system-kit-pages.mjs";

describe("system kit page audit contract", () => {
  it("audits Process and the unified Solutions view with all 115 expected orders", () => {
    expect(getTabs()).toEqual(["process", "solutions"]);
    expect(loadCanonicalServiceSlugs()).toEqual([
      "coach-business",
      "expert-comptable",
      "formalites-entreprise",
      "automatisation-processus",
      "application-metier",
      "gestion-reseaux-sociaux",
      "publicite-en-ligne",
      "prospection-ciblee",
    ]);

    const enterprises = loadEnterprises();
    const orders = buildExpectedSolutionOrders();
    expect(enterprises).toHaveLength(115);
    expect(orders.size).toBe(115);
    expect([...orders.values()].filter((order) => order.includes("levier")))
      .toHaveLength(0);
    expect(orders.get("batiment")).toEqual([
      "obat",
      "costructor",
      "progbat",
      "vertuoza",
      "coach-business",
      "expert-comptable",
      "formalites-entreprise",
      "automatisation-processus",
      "application-metier",
      "gestion-reseaux-sociaux",
      "publicite-en-ligne",
      "prospection-ciblee",
    ]);
    expect(orders.get("marchand-de-biens")).toEqual([
      "apimo",
      "modelo",
      "pipedrive",
      "coach-business",
      "expert-comptable",
      "formalites-entreprise",
      "automatisation-processus",
      "application-metier",
      "gestion-reseaux-sociaux",
      "publicite-en-ligne",
      "prospection-ciblee",
    ]);
    expect(orders.get("chasseur-immobilier")).toEqual([
      "apimo",
      "modelo",
      "pipedrive",
      "coach-business",
      "expert-comptable",
      "formalites-entreprise",
      "automatisation-processus",
      "application-metier",
      "gestion-reseaux-sociaux",
      "publicite-en-ligne",
      "prospection-ciblee",
    ]);
    expect([...orders.values()].some((order) => order.includes("netty"))).toBe(false);
    expect(orders.get("cabinet-comptable")).not.toContain("legal-formalist");
    expect(orders.get("cabinet-davocat")).not.toContain("formalites-juridiques");
    expect(orders.get("cabinet-davocat")).toContain("automatisation-processus");
    expect(orders.get("cabinet-davocat")).toContain("gestion-reseaux-sociaux");
    expect(orders.get("cabinet-davocat")).toContain("prospection-ciblee");
    expect([...orders.entries()].filter(([, order]) => order.includes("chartered-accountant")))
      .toHaveLength(0);
  });

  it("keeps the sealed V2 supplier augmentation out of the public audit", () => {
    const publicOrders = buildExpectedSolutionOrders();
    const candidateV2Orders = buildExpectedSolutionOrders({ expectCandidateV2: true });

    expect(candidateV2Orders).toEqual(publicOrders);
    expect([...candidateV2Orders.values()].some((order) =>
      order.includes("amazon-business")
    )).toBe(false);
  });

  it("expects no contact CTA in any system tab", () => {
    expect(getExpectedCallTexts("process")).toEqual([]);
    expect(getExpectedCallTexts("solutions")).toEqual([]);
    expect(getExpectedCallTexts("resources")).toEqual([]);
  });

  it("reads the ordered public Solution payload without widening its boundary", () => {
    const html = [
      '<script>"solutionSections":',
      '[{"resourceSlug":"levier"},{"resourceSlug":"obat"}]},\\"$abc',
      "Demaa footer</script>",
    ].join("");

    expect(collectSerializedSolutionSlugs(html)).toEqual(["levier", "obat"]);
    expect(getSerializedSolutionPayload(html)).toContain('resourceSlug":"levier');
    expect(getSerializedSolutionPayload(html)).not.toContain("Demaa footer");
  });
});
