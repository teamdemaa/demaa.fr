import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("system UX contract", () => {
  it("gives direct access to catalog resources without an e-mail wall", async () => {
    const detailSource = await readSource(
      "src/components/SystemDetailContent.tsx",
    );
    const resourcesSource = await readSource(
      "src/components/SystemResourcesTab.tsx",
    );
    const guidesRailSource = await readSource(
      "src/components/SystemGuidesRail.tsx",
    );
    const guideDialogSource = await readSource(
      "src/components/GuideSlidesDialog.tsx",
    );
    const openRouteSource = await readSource(
      "src/app/api/systeme-kit/open/[resourceSlug]/route.ts",
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
    expect(detailSource).toContain("<SystemGuidesRail");
    expect(detailSource).toContain("<SystemResourcesTab");
    expect(detailSource).not.toContain("OperationalSystemCopyRequestModal");
    expect(detailSource).not.toContain("HistoricalOperationalSystemCopyRequestModal");
    expect(resourcesSource).not.toContain("OperationalSystemCopyRequestModal");
    expect(resourcesSource).not.toContain("selectedResource");
    expect(resourcesSource).toContain("/api/systeme-kit/open/${resource.resourceSlug}");
    expect(resourcesSource).toContain('target="_blank"');
    expect(resourcesSource).toContain('rel="noopener noreferrer"');
    expect(resourcesSource).toContain("system_resource_opened");
    expect(guidesRailSource).not.toContain("OperationalSystemCopyRequestModal");
    expect(guidesRailSource).toContain("Être informé(e)");
    expect(guidesRailSource).not.toContain("downloadHref=");
    expect(guidesRailSource).toContain("system_resource_opened");
    expect(guideDialogSource).not.toContain("downloadHref");
    expect(guideDialogSource).not.toContain("Télécharger le PDF");
    expect(guideDialogSource).not.toContain("onRequestEmail");
    expect(openRouteSource).toContain("getSystemResourceAssetSnapshot");
    expect(openRouteSource).toContain("resolveSystemResourceDelivery");
    expect(openRouteSource).toContain("NextResponse.redirect");
    expect(historicalModalSource).toContain('name="firstName"');
    expect(historicalModalSource).toContain("Prénom");
    expect(historicalModalSource).toContain("Voir la démonstration");
    expect(historicalModalSource).toContain("Recevoir ma copie modifiable");
    expect(historicalModalSource).toContain('firstName: normalizedFirstName');
    expect(historicalModalSource).toContain('const flowKey = `system-copy:${systemSlug}`');
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
      "Besoin d’aide pour identifier la bonne solution ?",
    );
    expect(customOfferSource).toContain("Décrivez brièvement ce que vous souhaitez améliorer.");
    expect(customOfferSource).toContain(
      "Nous vous rappelons pour vous aider à comparer les options",
    );
    expect(customOfferSource).toContain("Premier échange offert · Sans engagement");
    expect(customOfferSource).toContain("OrganisationCallbackRequestButton");
    expect(customOfferSource).not.toContain("OrganisationSessionBookingButton");
    expect(customOfferSource).not.toContain("PreferentialRatesTrigger");
    expect(customOfferSource).toContain('buttonLabel: "Demander à être rappelé(e)"');
    expect(customOfferSource).toContain(
      'source: "Système métier - Demande de rappel solution"',
    );
    expect(customOfferSource).toContain(
      'source: "Système métier - Demande de rappel organisation"',
    );
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
