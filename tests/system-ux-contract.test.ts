import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("system UX contract", () => {
  it("keeps the Levier preview, e-mail form and confirmation in one modal", async () => {
    const detailSource = await readSource(
      "src/components/SystemDetailContent.tsx",
    );
    const modalSource = await readSource(
      "src/components/OperationalSystemCopyRequestModal.tsx",
    );
    const historicalModalSource = await readSource(
      "src/components/HistoricalOperationalSystemCopyRequestModal.tsx",
    );
    const pageSource = await readSource(
      "src/app/kit-operationnel/[slug]/page.tsx",
    );

    expect(detailSource).not.toContain("Voir le système");
    expect(detailSource).not.toContain("Recevoir ma copie modifiable");
    expect(detailSource).not.toContain("deliveryAvailable");
    expect(detailSource).not.toContain("hasLevierSolution");
    expect(detailSource).toContain("onOpenSystemDelivery");
    expect(detailSource).toContain('setDeliveryModal("levier")');
    expect(detailSource).toContain('deliveryModal === "levier"');
    expect(detailSource).toContain("preview={LEVIER_PREVIEW}");
    expect(detailSource).not.toContain("HistoricalOperationalSystemCopyRequestModal");
    expect(modalSource).not.toMatch(/"overview"\s*\|\s*"form"/);
    expect(modalSource).toContain("Recevoir Levier");
    expect(modalSource).toContain("Levier est dans votre boîte mail.");
    expect(modalSource).toContain(
      "Vous y trouverez le lien pour créer votre copie personnelle.",
    );
    expect(modalSource).toContain(
      "Pensez à vérifier vos courriers indésirables.",
    );
    expect(modalSource).not.toContain("Votre demande de Levier pour");
    expect(modalSource).toContain("Tableau de pilotage opérationnel");
    expect(modalSource).toContain('name="email"');
    expect(modalSource).not.toContain('name="firstName"');
    expect(modalSource).not.toContain("Prénom");
    expect(modalSource).not.toContain("openForm");
    expect(modalSource).not.toMatch(/Voir la démonstration|Google Drive/);
    expect(modalSource).not.toContain(
      "Des process concrets, des outils recommandés",
    );
    expect(modalSource).toContain('fetch("/api/systeme-kit/request"');
    expect(modalSource).not.toMatch(/Stripe|checkout|\/copy|\.xlsx/);
    expect(historicalModalSource).toContain('name="firstName"');
    expect(historicalModalSource).toContain("Prénom");
    expect(historicalModalSource).toContain("Voir la démonstration");
    expect(historicalModalSource).toContain("Recevoir ma copie modifiable");
    expect(historicalModalSource).toContain('firstName: normalizedFirstName');
    expect(historicalModalSource).toContain('const flowKey = `system-copy:${systemSlug}`');
    expect(modalSource).toContain('const flowKey = `levier:${systemSlug}`');
    expect(historicalModalSource).toContain('fetch("/api/systeme-kit/request"');
    expect(pageSource).not.toContain("getOperationalSystemDemoUrl");
    expect(pageSource).not.toContain("deliveryAvailable=");
    expect(pageSource).toContain("hasEditableOperationalSystemAsset");
  });

  it("renders the custom offer once after the active panel", async () => {
    const detailSource = await readSource(
      "src/components/SystemDetailContent.tsx",
    );
    const customOfferSource = await readSource(
      "src/components/SystemCustomOfferCta.tsx",
    );
    const solutionsSource = await readSource(
      "src/components/SystemSolutionsTab.tsx",
    );
    const panelEnd = detailSource.indexOf("</section>");
    const customOffer = detailSource.indexOf("<SystemCustomOfferCta");

    expect(panelEnd).toBeGreaterThan(-1);
    expect(customOffer).toBeGreaterThan(panelEnd);
    expect(detailSource.match(/<SystemCustomOfferCta\b/g)).toHaveLength(1);
    expect(detailSource).not.toMatch(
      /academyVideos|Académie Demaa|Comprendre les indicateurs de ce système|Lire la fiche/,
    );
    expect(customOfferSource).toContain(
      "Besoin d’une application adaptée à votre métier ?",
    );
    expect(customOfferSource).toContain('href="/services"');
    expect(customOfferSource).toContain("Voir les services");
    expect(customOfferSource).not.toMatch(
      /OrganisationSessionBookingButton|Réserver mon échange|filloutId|fillout\.com|https?:\/\//,
    );
    expect(solutionsSource).not.toMatch(
      /SystemCustomOfferCta|Diagnostic offert|appel gratuit/,
    );
  });

  it("keeps Process and Solutions as lightweight balanced tabs", async () => {
    const detailSource = await readSource(
      "src/components/SystemDetailContent.tsx",
    );

    expect(detailSource).toContain(
      "grid w-full grid-cols-2 border-b border-dema-line",
    );
    expect(detailSource).toContain("min-h-11");
    expect(detailSource).toContain(
      "border-dema-forest font-semibold text-dema-forest",
    );
    expect(detailSource).toContain(
      "border-transparent font-medium text-dema-muted",
    );
    expect(detailSource).not.toContain(
      "grid w-full grid-cols-2 gap-1 rounded-full",
    );
  });
});
