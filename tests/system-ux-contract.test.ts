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
    const resourcePreviewSource = await readSource(
      "src/components/SystemResourcePreviewModal.tsx",
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
    expect(detailSource).not.toContain("Pour voir plus de documents");
    expect(detailSource).not.toContain("allez dans Académie");
    expect(detailSource).not.toContain("deliveryAvailable");
    expect(detailSource).not.toContain("hasLevierSolution");
    expect(detailSource).toContain("<SystemGuidesRail");
    expect(detailSource).toContain("<SystemResourcesTab");
    expect(detailSource).not.toContain("OperationalSystemCopyRequestModal");
    expect(detailSource).not.toContain("HistoricalOperationalSystemCopyRequestModal");
    expect(resourcesSource).not.toContain("OperationalSystemCopyRequestModal");
    expect(resourcesSource).not.toContain("SystemRecapRequestModal");
    expect(resourcesSource).toContain("SystemResourcePreviewModal");
    expect(resourcesSource).toContain("/kit-operationnel/${systemSlug}/recapitulatif");
    expect(resourcesSource).not.toContain("/api/systeme-kit/request");
    expect(resourcePreviewSource).toContain("/api/systeme-kit/open/${resource.resourceSlug}");
    expect(resourcePreviewSource).toContain('target="_blank"');
    expect(resourcePreviewSource).toContain('rel="noopener noreferrer"');
    expect(resourcePreviewSource).toContain("resource.preview");
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

  it("keeps Academy models aligned with the same preview journey", async () => {
    const academySource = await readSource(
      "src/components/AcademyIndexClient.tsx",
    );

    expect(academySource).toContain("SystemResourcePreviewModal");
    expect(academySource).toContain('href="/systemes"');
    expect(academySource).toContain("Choisir un système");
    expect(academySource).not.toContain("/api/systeme-kit/request");
    expect(academySource).not.toContain("accessibles directement");
  });

  it("provides a clear fallback when native printing is unavailable", async () => {
    const [printButtonSource, recapSource, globalStyles] = await Promise.all([
      readSource("src/components/SystemRecapPrintButton.tsx"),
      readSource("src/app/kit-operationnel/[slug]/recapitulatif/page.tsx"),
      readSource("src/app/globals.css"),
    ]);

    expect(printButtonSource).toContain('typeof window.print === "function"');
    expect(printButtonSource).toContain("Copier le lien");
    expect(printButtonSource).toContain("Chrome, Safari ou Firefox");
    expect(recapSource).toContain("data-system-recap");
    expect(globalStyles).toContain("@page");
    expect(globalStyles).toContain("size: A4");
  });

  it("keeps every system tab free of contact CTAs", async () => {
    const detailSource = await readSource(
      "src/components/SystemDetailContent.tsx",
    );
    const solutionsSource = await readSource(
      "src/components/SystemSolutionsTab.tsx",
    );

    expect(detailSource).not.toContain("SystemCustomOfferCta");
    expect(detailSource).not.toContain("OrganisationCallbackRequestButton");
    expect(detailSource).not.toContain("Votre solution peut aider ce métier ?");
    expect(detailSource).not.toContain('href="/partenaires"');
    expect(detailSource).not.toMatch(
      /academyVideos|Académie Demaa|Comprendre les indicateurs de ce système|Lire la fiche/,
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
