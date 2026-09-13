import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { repriseOpportunities } from "@/lib/reprise-opportunities";

describe("marketplace À reprendre", () => {
  it("publishes the 30 sanitized opportunities without private contact data", () => {
    expect(repriseOpportunities).toHaveLength(30);
    expect(new Set(repriseOpportunities.map(({ id }) => id)).size).toBe(30);

    const publicPayload = JSON.stringify(repriseOpportunities);
    expect(publicPayload).not.toContain("linkedin.com");
    expect(publicPayload).not.toContain('"ND"');
    expect(publicPayload).not.toMatch(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
    expect(publicPayload).not.toMatch(/(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}/);
  });

  it("keeps the MVP transparent and separates buyer and seller requests", async () => {
    const [marketplace, estimateControl, buyerRoute, sellerRoute, page] = await Promise.all([
      readFile(new URL("../src/components/RepriseMarketplaceClient.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/BusinessEstimateControl.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/api/reprise-interest/route.ts", import.meta.url), "utf8"),
      readFile(new URL("../src/app/api/business-estimate/route.ts", import.meta.url), "utf8"),
      readFile(new URL("../src/app/(marketing)/a-reprendre/page.tsx", import.meta.url), "utf8"),
    ]);

    expect(marketplace).toContain("Informations déclaratives · disponibilité à confirmer");
    expect(marketplace).toContain("Demaa vérifie d’abord que l’opportunité est toujours disponible");
    expect(marketplace).toContain("Demander une mise en relation");
    expect(marketplace).toContain("Obtenez une première estimation de votre entreprise");
    expect(estimateControl).toContain("Vous n’avez pas besoin d’avoir tous les chiffres");
    expect(estimateControl).toContain('name="name"');
    expect(estimateControl).toContain('name="email"');
    expect(estimateControl).toContain('name="phone"');
    expect(estimateControl).toContain('name="company"');
    expect(estimateControl).toContain('name="message"');
    expect(estimateControl).not.toContain('name="revenue"');
    expect(estimateControl).not.toContain('name="profitability"');
    expect(estimateControl).not.toContain('name="employees"');
    expect(buyerRoute).toContain('requestType: "reprise_interest"');
    expect(sellerRoute).toContain('requestType: "business_estimate_request"');
    expect(sellerRoute).toContain("Merci de renseigner votre nom et une adresse email valide.");
    expect(page).toContain('canonical: "/a-reprendre"');
  });
});
