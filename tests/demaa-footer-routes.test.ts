import { describe, expect, it } from "vitest";
import { usesDemaaFooter } from "@/lib/demaa-footer-routes";

describe("DEMAA marketing footer routing", () => {
  it("shows the Demaa footer throughout every marketing route", () => {
    for (const pathname of [
      "/academie", "/academie/piloter-sa-tresorerie", "/solutions",
      "/solutions/batiment", "/solutions/batiment/comparatif-outils",
      "/specialistes", "/annuaire-coachs", "/annuaire-experts-comptables/cabinets",
      "/services/automatisation-ia", "/modeles", "/outils/generation-de-qr-code",
      "/systemes/batiment/processus", "/annuaire-fournisseurs/batiment",
      "/a-reprendre", "/a-reprendre/une-pme", "/transmettre", "/tutoriels", "/accompagnement",
    ]) {
      expect(usesDemaaFooter(pathname), pathname).toBe(true);
    }
  });

  it("does not select a footer before a pathname is available", () => {
    for (const pathname of [
      null,
    ]) {
      expect(usesDemaaFooter(pathname), String(pathname)).toBe(false);
    }
  });
});
