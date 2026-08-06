import { describe, expect, it } from "vitest";

import {
  buildExpectedSolutionOrders,
  collectSerializedSolutionSlugs,
  getSerializedSolutionPayload,
  getExpectedCallTexts,
  getTabs,
  loadEnterprises,
} from "../scripts/audit-system-kit-pages.mjs";

describe("system kit page audit contract", () => {
  it("audits Process, Solutions and Resources with all 115 expected orders", () => {
    expect(getTabs()).toEqual(["process", "solutions", "resources"]);

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
      "point-p",
      "plateforme-du-batiment",
      "kiloutou",
      "wurth",
      "capeb",
    ]);
    expect(orders.get("marchand-de-biens")).toEqual([
      "apimo",
      "modelo",
      "pipedrive",
      "notaires",
      "fnaim",
    ]);
    expect(orders.get("chasseur-immobilier")).toEqual([
      "apimo",
      "modelo",
      "pipedrive",
      "fnaim",
      "notaires",
    ]);
    expect([...orders.values()].some((order) => order.includes("netty"))).toBe(false);
  });

  it("expects the CTA copy that belongs to each active tab", () => {
    expect(getExpectedCallTexts("process")).toEqual([
      "Besoin de prendre du recul sur votre organisation ?",
      "Réserver mon échange offert",
    ]);
    expect(getExpectedCallTexts("solutions")).toEqual([
      "Besoin d’aide pour identifier la bonne solution ?",
      "Échanger 30 minutes",
    ]);
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
