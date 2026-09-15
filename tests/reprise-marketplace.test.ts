import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  getRepriseOpportunityInformationScore,
  repriseOpportunities,
  sortRepriseOpportunitiesByInformation,
} from "@/lib/reprise-opportunities";
import { clusterRepriseMapLocations } from "@/lib/reprise-map-layout";

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

  it("clusters nearby map locations without inventing a distant display position", () => {
    const clusters = clusterRepriseMapLocations([
      { id: "paris", latitude: 48.8566, longitude: 2.3522 },
      { id: "seine-et-marne", latitude: 48.6, longitude: 2.9 },
      { id: "lyon", latitude: 45.764, longitude: 4.8357 },
    ]);

    expect(clusters).toHaveLength(2);
    expect(clusters[0].locations.map(({ id }) => id)).toEqual(["paris", "seine-et-marne"]);
    expect(clusters[0].position.latitude).toBeCloseTo(48.7283);
    expect(clusters[0].position.longitude).toBeCloseTo(2.6261);
    expect(clusters[1]).toEqual({
      locations: [{ id: "lyon", latitude: 45.764, longitude: 4.8357 }],
      position: { latitude: 45.764, longitude: 4.8357 },
    });
  });

  it("keeps the Lyon cluster on Lyon", () => {
    const locations = repriseOpportunities.flatMap((opportunity) => opportunity.mapPosition ? [{
      id: opportunity.id,
      latitude: opportunity.mapPosition.latitude,
      longitude: opportunity.mapPosition.longitude,
    }] : []);
    const lyonCluster = clusterRepriseMapLocations(locations).find((cluster) => (
      cluster.locations.some(({ id }) => id === "relation-client-lyon")
    ));

    expect(lyonCluster?.locations.map(({ id }) => id)).toEqual(expect.arrayContaining([
      "relation-client-lyon",
      "nettoyage-industriel-rhone-alpes",
      "maintenance-piscines-auvergne-rhone-alpes",
    ]));
    expect(lyonCluster?.position.latitude).toBeCloseTo(45.676);
    expect(lyonCluster?.position.longitude).toBeCloseTo(4.5238);
  });

  it("keeps buyer search focused and moves every seller action to Transmission", async () => {
    const [marketplace, opportunityDetail, projectControl, sellerActions, saleDialog, valuationDialog, map, projectRoute, buyerRoute, sellerRoute, page, transmission] = await Promise.all([
      readFile(new URL("../src/components/RepriseMarketplaceClient.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/RepriseOpportunityDetail.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/RepriseProjectControl.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/BusinessSellerActions.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/BusinessSaleDialog.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/BusinessValuationDialog.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/RepriseOpportunityMap.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/api/reprise-project/route.ts", import.meta.url), "utf8"),
      readFile(new URL("../src/app/api/reprise-interest/route.ts", import.meta.url), "utf8"),
      readFile(new URL("../src/app/api/business-estimate/route.ts", import.meta.url), "utf8"),
      readFile(new URL("../src/app/(marketing)/a-reprendre/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/BusinessSaleLandingPage.tsx", import.meta.url), "utf8"),
    ]);

    expect(marketplace).not.toContain("Informations déclaratives · disponibilité à confirmer");
    expect(marketplace).not.toContain("Marketplace d’entreprises de services à reprendre");
    expect(marketplace).toContain("Reprenez une PME B2B rentable.");
    expect(marketplace).toContain('<header className="text-left sm:text-center">');
    expect(marketplace).not.toContain("ChevronRight");
    expect(marketplace).toContain(
      "text-base leading-7 text-dema-muted sm:text-lg sm:leading-8",
    );
    expect(marketplace).toContain("Services B2B récurrents, activités techniques, industrie et logiciels métier.");
    expect(marketplace.match(/<RepriseProjectControl \/>/g)).toHaveLength(2);
    expect(projectControl).toContain("Confier ma recherche");
    expect(projectControl).toContain("Confier ma recherche à Demaa");
    expect(projectControl).toContain('fetch("/api/reprise-project"');
    expect(projectControl.indexOf("Activité recherchée")).toBeLessThan(projectControl.indexOf("Prénom et nom"));
    expect(marketplace).not.toContain("La marketplace des PME de services à reprendre.");
    expect(opportunityDetail).toContain("Demaa vous recontacte avant de transmettre votre demande");
    expect(opportunityDetail).toContain("Demander une mise en relation");
    expect(opportunityDetail.indexOf("Votre projet en quelques mots")).toBeLessThan(opportunityDetail.indexOf("Prénom et nom"));
    expect(opportunityDetail.indexOf('name="phone"')).toBeLessThan(opportunityDetail.indexOf('name="company"'));
    expect(opportunityDetail).not.toContain("(facultatif)");
    expect(marketplace).not.toContain("Obtenez une première estimation de votre entreprise");
    expect(marketplace).toContain("Comment ça marche ?");
    expect(marketplace).toContain("Vous nous confiez votre recherche");
    expect(marketplace).toContain("Nous recherchons");
    expect(marketplace).toContain("Nous organisons la mise en relation");
    expect(marketplace).toContain('className="border-t border-dema-line px-5 pb-14 pt-6 sm:px-8 sm:pb-20 sm:pt-10"');
    expect(opportunityDetail).toContain('value={opportunity.revenue ?? "Non disponible"}');
    expect(opportunityDetail).toContain('value={opportunity.askingPrice ?? "Non disponible"}');
    expect(marketplace).toContain("Carte des opportunités");
    expect(marketplace).toContain('<MapIcon className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />');
    expect(marketplace).toContain("Ajouter au comparatif");
    expect(marketplace).toContain("getRepriseOpportunityPath(opportunity)");
    expect(marketplace).toContain('aria-haspopup="dialog"');
    expect(marketplace).toContain("event.preventDefault()");
    expect(marketplace).toContain("Recevoir les nouvelles opportunités");
    expect(marketplace).toContain('id="reprise-search-mobile"');
    expect(marketplace).toContain("transition-[grid-template-columns]");
    expect(marketplace).toContain('setIsMobileSearchOpen(true)');
    expect(marketplace).toContain('setQuery(""); setIsMobileSearchOpen(false);');
    expect(marketplace).toContain('id="reprise-search" type="search"');
    expect(marketplace).toContain('className="demaa-search-control"');
    expect(marketplace).not.toContain('id="reprise-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-full bg-dema-paper py-4 pl-12 pr-16 text-sm');
    expect(marketplace).not.toContain("placeholder:text-brand-blue/30 focus:ring-2");
    expect(marketplace).not.toContain("publicCtaLabel");
    expect(marketplace).not.toContain("BusinessSellerActions");
    expect(marketplace).toContain("<RepriseAlertDialog");
    expect(marketplace).toContain("useSyncExternalStore(subscribeToBrowserEnvironment, getBrowserSnapshot, getServerSnapshot)");
    expect(marketplace).toContain("const portalRoot = isBrowser ? document.body : null");
    expect(marketplace).toContain("portalRoot && selectedOpportunity ? createPortal");
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
    expect(sellerActions).toContain("Présenter mon entreprise");
    expect(sellerActions).toContain("Estimer mon entreprise");
    expect(sellerActions).toContain("bg-dema-forest");
    expect(sellerActions).toContain("flex-col items-start justify-start");
    expect(sellerActions).toContain("sm:items-center sm:justify-center");
    expect(sellerActions).not.toContain("w-fit self-center");
    expect(transmission).toContain('<BusinessSellerActions variant="hero" />');
    expect(transmission).toContain('<BusinessSellerActions variant="sale" />');
    expect(sellerActions).toContain('get("intent") === "valuation"');
    expect(sellerActions).toContain('variant !== "sale"');
    expect(saleDialog).toContain("Décrivez-nous d’abord votre entreprise et votre projet de vente");
    expect(saleDialog).toContain("Votre entreprise et votre projet en quelques mots");
    expect(saleDialog.indexOf('name="message"')).toBeLessThan(saleDialog.indexOf('name="name"'));
    expect(saleDialog.indexOf('name="name"')).toBeLessThan(saleDialog.indexOf('name="email"'));
    expect(saleDialog.indexOf('name="email"')).toBeLessThan(saleDialog.indexOf('name="phone"'));
    expect(saleDialog.indexOf('name="phone"')).toBeLessThan(saleDialog.indexOf('name="company"'));
    expect(valuationDialog).toContain("Étape ${step} sur 3");
    expect(valuationDialog).toContain("Fourchette basse");
    expect(valuationDialog).toContain("Estimation centrale");
    expect(valuationDialog).toContain("Fourchette haute");
    expect(valuationDialog).toContain('label="Excédent brut d’exploitation annuel (EBE)"');
    expect(valuationDialog).not.toContain('label="Résultat annuel (EBE)"');
    expect(valuationDialog).toContain("Présenter mon entreprise");
    expect(map).not.toContain("onLocationSelect");
    expect(map).not.toContain("Filtrer sur");
    expect(map).toContain("Voir la fiche");
    expect(map).toContain("clusterRepriseMapLocations");
    expect(map).toContain("<foreignObject");
    expect(marketplace).toContain("setShowMobileMap(false); setSelectedOpportunity(opportunity)");
    expect(projectRoute).toContain('requestType: "reprise_project_request"');
    expect(projectRoute).toContain('channels: { email: true, resend: false, slack: false }');
    expect(projectRoute).toContain("rechercher des entreprises adaptées");
    expect(buyerRoute).toContain('requestType: "reprise_interest"');
    expect(buyerRoute).toContain('channels: { email: true, resend: false, slack: false }');
    expect(buyerRoute).toContain("Merci de présenter brièvement votre projet");
    expect(buyerRoute).toContain("contact: { company, email, name, phone }");
    expect(sellerRoute).toContain('requestType: "business_sale_request"');
    expect(sellerRoute).toContain('channels: { email: true, resend: false, slack: false }');
    expect(sellerRoute).toContain("Merci de présenter brièvement votre entreprise");
    expect(sellerRoute).toContain('source: "Demaa - Projet de vente"');
    expect(sellerRoute).toContain('{ label: "Projet de vente", value: message }');
    expect(sellerRoute).not.toContain("Projet de transmission");
    expect(page).toContain('path: "/a-reprendre"');
  });
});
