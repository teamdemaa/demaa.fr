import { describe, expect, it } from "vitest";
import { usesDemaaFooter } from "@/lib/demaa-footer-routes";

describe("DEMAA marketing footer routing", () => {
  it("shows the DEMAA footer throughout the new editorial and directory routes", () => {
    for (const pathname of [
      "/academie", "/academie/piloter-sa-tresorerie", "/solutions",
      "/solutions/batiment", "/solutions/batiment/comparatif-outils",
      "/specialistes", "/annuaire-coachs", "/annuaire-experts-comptables/cabinets",
      "/services/automatisation-ia", "/modeles", "/outils/generation-de-qr-code",
      "/systemes/batiment/processus", "/annuaire-fournisseurs/batiment",
    ]) {
      expect(usesDemaaFooter(pathname), pathname).toBe(true);
    }
  });

  it("leaves reprise, transmission and legal pages on their existing footer", () => {
    for (const pathname of [
      null, "/", "/a-reprendre", "/a-reprendre/une-pme", "/transmettre",
      "/tutoriels", "/accompagnement", "/mentions-legales", "/solutions-archive",
    ]) {
      expect(usesDemaaFooter(pathname), String(pathname)).toBe(false);
    }
  });
});
