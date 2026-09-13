import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  getRepriseOpportunityInformationScore,
  repriseOpportunities,
  sortRepriseOpportunitiesByInformation,
} from "@/lib/reprise-opportunities";

describe("marketplace À reprendre", () => {
  it("publishes the 38 sanitized opportunities without private contact data", () => {
    expect(repriseOpportunities).toHaveLength(38);
    expect(new Set(repriseOpportunities.map(({ id }) => id)).size).toBe(38);

    const publicPayload = JSON.stringify(repriseOpportunities);
    expect(publicPayload).not.toContain("linkedin.com");
    expect(publicPayload).not.toContain('"ND"');
    expect(publicPayload).not.toMatch(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
    expect(publicPayload).not.toMatch(/(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}/);
    expect(publicPayload).not.toMatch(/à confirmer|mandat à confirmer|piste hors marché/i);
    expect(repriseOpportunities.filter((opportunity) => opportunity.mapPosition)).toHaveLength(26);
    expect(repriseOpportunities.map(({ id }) => id)).toEqual(expect.arrayContaining([
      "fitness-premium-herault",
      "voyages-aventure-premium",
      "second-oeuvre-renovation-france",
      "communication-objet-textile-b2b",
      "services-it-telecoms-manages",
      "machines-speciales-b2b",
      "chaudronnerie-maintenance-industrielle",
      "travaux-publics-grand-ouest",
    ]));
  });

  it("shows the opportunities with the most published information first", () => {
    const sorted = sortRepriseOpportunitiesByInformation(repriseOpportunities);
    const scores = sorted.map(getRepriseOpportunityInformationScore);

    expect(scores).toEqual(scores.toSorted((left, right) => right - left));
    expect(scores[0]).toBe(4);
    expect(sorted.filter((opportunity) => getRepriseOpportunityInformationScore(opportunity) === 4)).toEqual(
      repriseOpportunities.filter((opportunity) => getRepriseOpportunityInformationScore(opportunity) === 4),
    );
  });

  it("keeps the MVP transparent and separates buyer and seller requests", async () => {
    const [marketplace, estimateControl, buyerRoute, sellerRoute, page] = await Promise.all([
      readFile(new URL("../src/components/RepriseMarketplaceClient.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/BusinessEstimateControl.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/api/reprise-interest/route.ts", import.meta.url), "utf8"),
      readFile(new URL("../src/app/api/business-estimate/route.ts", import.meta.url), "utf8"),
      readFile(new URL("../src/app/(marketing)/a-reprendre/page.tsx", import.meta.url), "utf8"),
    ]);

    expect(marketplace).not.toContain("Informations déclaratives · disponibilité à confirmer");
    expect(marketplace).not.toContain("Marketplace d’entreprises de services à reprendre");
    expect(marketplace).toContain("Reprenez une entreprise qui fonctionne déjà.");
    expect(marketplace).toContain('<header className="text-left sm:text-center">');
    expect(marketplace).not.toContain("ChevronRight");
    expect(marketplace).toContain("font-serif text-2xl font-light italic");
    expect(marketplace).toContain("Entreprises en activité · Clients existants · Équipe ou savoir-faire déjà en place");
    expect(marketplace.indexOf("Reprenez une entreprise qui fonctionne déjà.")).toBeLessThan(
      marketplace.indexOf("Entreprises en activité · Clients existants · Équipe ou savoir-faire déjà en place"),
    );
    expect(marketplace).not.toContain("La marketplace des PME de services à reprendre.");
    expect(marketplace).toContain("Demaa vous recontacte avant de transmettre votre demande");
    expect(marketplace).toContain("Demander une mise en relation");
    expect(marketplace.indexOf("Votre projet en quelques mots")).toBeLessThan(marketplace.indexOf("Prénom et nom"));
    expect(marketplace.indexOf('name="phone"')).toBeLessThan(marketplace.indexOf('name="company"'));
    expect(marketplace).not.toContain("(facultatif)");
    expect(marketplace).toContain("Obtenez une première estimation de votre entreprise");
    expect(marketplace).toContain('leading-[1.02] tracking-[-0.045em]');
    expect(marketplace).toContain('className="border-t border-dema-line px-5 pb-14 pt-6 sm:px-8 sm:pb-20 sm:pt-10"');
    expect(marketplace).toContain('value={opportunity.revenue ?? "Non disponible"}');
    expect(marketplace).toContain('value={opportunity.askingPrice ?? "Non disponible"}');
    expect(marketplace).toContain("Carte des opportunités");
    expect(marketplace).toContain('<MapIcon className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />');
    expect(marketplace).toContain("Ajouter au comparatif");
    expect(marketplace).toContain("Recevoir les nouvelles opportunités");
    expect(marketplace).toContain('publicCtaLabel="Vendre mon entreprise"');
    expect(marketplace).toContain('label="Vendre mon entreprise"');
    expect(marketplace.indexOf('label="Vendre mon entreprise"')).toBeLessThan(
      marketplace.indexOf('id="reprise-search"'),
    );
    expect(marketplace).toContain("<RepriseAlertDialog");
    expect(marketplace).toContain("Comparer les entreprises");
    expect(marketplace).not.toContain("Les entreprises sont présentées en colonnes et les critères en lignes");
    expect(marketplace).not.toContain("Comparez les informations publiées pour chaque entreprise");
    expect(marketplace).not.toContain("Aucun score automatique n’est appliqué");
    expect(marketplace).toContain("<table");
    expect(marketplace).toContain("<thead>");
    expect(marketplace).toContain("<tbody>");
    expect(marketplace).toContain("Critères");
    expect(marketplace).toContain("Faites glisser pour voir les autres entreprises");
    expect(marketplace).toContain('className="w-[8.5rem] sm:w-[11rem]"');
    expect(marketplace).toContain("{opportunity.activity}");
    expect(estimateControl).toContain("Vous n’avez pas besoin d’avoir tous les chiffres");
    expect(estimateControl).toContain("Votre entreprise en quelques mots");
    expect(estimateControl.indexOf('name="message"')).toBeLessThan(estimateControl.indexOf('name="name"'));
    expect(estimateControl.indexOf('name="name"')).toBeLessThan(estimateControl.indexOf('name="email"'));
    expect(estimateControl.indexOf('name="email"')).toBeLessThan(estimateControl.indexOf('name="phone"'));
    expect(estimateControl.indexOf('name="phone"')).toBeLessThan(estimateControl.indexOf('name="company"'));
    expect(estimateControl).toContain("createPortal(<EstimateDialog");
    expect(estimateControl).toContain('name="name"');
    expect(estimateControl).toContain('name="email"');
    expect(estimateControl).toContain('name="phone"');
    expect(estimateControl).toContain('name="company"');
    expect(estimateControl).toContain('name="message"');
    expect(estimateControl).not.toContain('name="revenue"');
    expect(estimateControl).not.toContain('name="profitability"');
    expect(estimateControl).not.toContain('name="employees"');
    expect(buyerRoute).toContain('requestType: "reprise_interest"');
    expect(buyerRoute).toContain('channels: { email: true, resend: false, slack: false }');
    expect(buyerRoute).toContain("Merci de présenter brièvement votre projet");
    expect(buyerRoute).toContain("contact: { company, email, name, phone }");
    expect(sellerRoute).toContain('requestType: "business_estimate_request"');
    expect(sellerRoute).toContain('channels: { email: true, resend: false, slack: false }');
    expect(sellerRoute).toContain("Merci de présenter brièvement votre entreprise");
    expect(page).toContain('canonical: "/a-reprendre"');
  });
});
