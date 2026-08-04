import { describe, expect, it } from "vitest";

import {
  buildExpectedSolutionOrders,
  collectSerializedSolutionSlugs,
  getSerializedSolutionPayload,
  getTabs,
  loadEnterprises,
} from "../scripts/audit-system-kit-pages.mjs";

describe("system kit page audit contract", () => {
  it("audits only Process and Solutions with all 115 expected orders", () => {
    expect(getTabs()).toEqual(["process", "solutions"]);

    const enterprises = loadEnterprises();
    const orders = buildExpectedSolutionOrders();
    expect(enterprises).toHaveLength(115);
    expect(orders.size).toBe(115);
    expect([...orders.values()].filter((order) => order.includes("levier")))
      .toHaveLength(84);
    expect(orders.get("batiment")).toEqual([
      "obat",
      "costructor",
      "levier",
      "progbat",
      "vertuoza",
      "point-p",
      "plateforme-du-batiment",
      "kiloutou",
      "wurth",
      "capeb",
    ]);
  });

  it("reads the ordered public Solution payload without widening its boundary", () => {
    const html = [
      '<script>"solutionSections":',
      '{"resourceSlug":"levier"},{"resourceSlug":"obat"}',
      ',"academyVideos":[]</script>',
    ].join("");

    expect(collectSerializedSolutionSlugs(html)).toEqual(["levier", "obat"]);
    expect(getSerializedSolutionPayload(html)).toContain('resourceSlug":"levier');
    expect(getSerializedSolutionPayload(html)).not.toContain("academyVideos");
  });
});
