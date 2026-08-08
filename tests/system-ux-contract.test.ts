import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("system UX contract", () => {
  it("keeps each resource preview, e-mail form and confirmation in one modal", async () => {
    const detailSource = await readSource(
      "src/components/SystemDetailContent.tsx",
    );
    const modalSource = await readSource(
      "src/components/OperationalSystemCopyRequestModal.tsx",
    );
    const resourcesSource = await readSource(
      "src/components/SystemResourcesTab.tsx",
    );
    const historicalModalSource = await readSource(
      "src/components/HistoricalOperationalSystemCopyRequestModal.tsx",
    );
    const pageSource = await readSource(
      "src/app/kit-operationnel/[slug]/page.tsx",
    );

    expect(detailSource).not.toContain("Voir le système");
    expect(detailSource).not.toContain("Système opérationnel");
    expect(detailSource).not.toContain("Recevoir ma copie modifiable");
    expect(detailSource).not.toContain("deliveryAvailable");
    expect(detailSource).not.toContain("hasLevierSolution");
    expect(detailSource).toContain('<SystemResourcesTab systemSlug={system.slug} />');
    expect(detailSource).not.toContain("OperationalSystemCopyRequestModal");
    expect(resourcesSource).toContain("selectedResource ?");
    expect(resourcesSource).toContain("resource={selectedResource}");
    expect(detailSource).not.toContain("HistoricalOperationalSystemCopyRequestModal");
    expect(modalSource).not.toMatch(/"overview"\s*\|\s*"form"/);
    expect(modalSource).toContain("resource.deliveryLabel");
    expect(modalSource).toContain("Votre ressource est dans votre boîte mail.");
    expect(modalSource).toContain("resource.successDescription");
    expect(modalSource).toContain("resource.previewDisclosure");
    expect(modalSource).toContain('loading="eager"');
    expect(modalSource).toContain('name="email"');
    expect(modalSource).not.toContain('name="firstName"');
    expect(modalSource).not.toContain("Prénom");
    expect(modalSource).toContain('name="marketingConsent"');
    expect(modalSource).toContain("Facultatif");
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
    expect(modalSource).toContain('const flowKey = `resource:${resource.resourceSlug}:${systemSlug}`');
    expect(historicalModalSource).toContain('fetch("/api/systeme-kit/request"');
    expect(pageSource).not.toContain("getOperationalSystemDemoUrl");
    expect(pageSource).not.toContain("deliveryAvailable=");
    expect(pageSource).toContain("hasEditableOperationalSystemAsset");
  });

  it("renders one contextual custom offer after Process and Solutions only", async () => {
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
    expect(detailSource).toContain("systemSlug={system.slug}");
    expect(detailSource).toContain("context={activeTab}");
    expect(detailSource).toContain('activeTab !== "resources"');
    expect(detailSource).not.toContain("Votre solution peut aider ce métier ?");
    expect(detailSource).not.toContain('href="/partenaires"');
    expect(detailSource).not.toMatch(
      /academyVideos|Académie Demaa|Comprendre les indicateurs de ce système|Lire la fiche/,
    );
    expect(customOfferSource).toContain(
      "Besoin de prendre du recul sur votre organisation ?",
    );
    expect(customOfferSource).toContain(
      "Besoin d’aide pour choisir la bonne solution ?",
    );
    expect(customOfferSource).toContain("Décrivez-nous ce qui vous bloque.");
    expect(customOfferSource).toContain(
      "Expliquez-nous votre besoin.",
    );
    expect(customOfferSource).toContain("SystemCallbackRequestButton");
    expect(customOfferSource).toContain('buttonLabel: "Demander à être rappelé"');
    const callbackButtonSource = await readSource(
      "src/components/SystemCallbackRequestButton.tsx",
    );
    expect(callbackButtonSource).toContain('"/api/callback-request"');
    expect(callbackButtonSource).toContain("Demander à être rappelé");
    expect(callbackButtonSource).toContain("aria-modal");
    expect(callbackButtonSource).toContain("firstName");
    expect(callbackButtonSource).toContain("preferredTime");
    expect(callbackButtonSource).not.toContain('name="email"');
    expect(customOfferSource).not.toMatch(
      /href="\/services"|Voir les services|application sur mesure/,
    );
    expect(solutionsSource).not.toMatch(
      /SystemCustomOfferCta|Diagnostic offert|appel gratuit/,
    );
  });

  it("keeps Process, Solutions and Resources as lightweight balanced tabs", async () => {
    const detailSource = await readSource(
      "src/components/SystemDetailContent.tsx",
    );

    expect(detailSource).toContain(
      "grid w-full grid-cols-3 border-b border-dema-line",
    );
    expect(detailSource).toContain("min-h-11");
    expect(detailSource).toContain(
      "border-dema-forest font-semibold text-dema-forest",
    );
    expect(detailSource).toContain(
      "border-transparent font-medium text-dema-muted",
    );
    expect(detailSource).not.toContain(
      "grid w-full grid-cols-3 gap-1 rounded-full",
    );
  });
});
