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
    const pageSource = await readSource(
      "src/app/(marketing)/solutions/[slug]/page.tsx",
    );

    expect(detailSource).not.toContain("Voir le système");
    expect(detailSource).not.toContain("Système opérationnel");
    expect(detailSource).not.toContain("Recevoir ma copie modifiable");
    expect(detailSource).not.toContain("Pour voir plus de documents");
    expect(detailSource).not.toContain("allez dans Académie");
    expect(detailSource).not.toContain("deliveryAvailable");
    expect(detailSource).not.toContain("hasLevierSolution");
    expect(detailSource).not.toContain("<SystemGuidesRail");
    expect(detailSource).not.toContain("<SystemResourcesTab");
    expect(detailSource).toContain("Voir les processus du métier");
    expect(detailSource).toContain('className="demaa-primary-button mt-5 min-h-10 px-5"');
    expect(detailSource).not.toContain("OperationalSystemCopyRequestModal");
    expect(resourcesSource).not.toContain("OperationalSystemCopyRequestModal");
    expect(resourcesSource).not.toContain("SystemRecapRequestModal");
    expect(resourcesSource).toContain("SystemResourcePreviewModal");
    expect(resourcesSource).toContain("/systemes/${systemSlug}/processus");
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
    expect(pageSource).not.toContain("getOperationalSystemDemoUrl");
    expect(pageSource).not.toContain("deliveryAvailable=");
    expect(pageSource).toContain("hasEditableOperationalSystemAsset");
  });

  it("keeps models out of Academy because they have their own public catalogue", async () => {
    const academySource = await readSource(
      "src/components/AcademyIndexClient.tsx",
    );

    expect(academySource).not.toContain("Modèles et documents");
    expect(academySource).not.toContain("SystemResourcePreviewModal");
    expect(academySource).not.toContain("SYSTEM_RESOURCES");
  });

  it("provides a process-only printable page and a clear native-print fallback", async () => {
    const [
      printButtonSource,
      processesPageSource,
      processesContentSource,
      processesModalSource,
      processesDialogSource,
      processesEmailDialogSource,
      processesEmailRouteSource,
      globalStyles,
    ] = await Promise.all([
      readSource("src/components/SystemRecapPrintButton.tsx"),
      readSource("src/app/(marketing)/systemes/[slug]/processus/page.tsx"),
      readSource("src/components/SystemProcessesContent.tsx"),
      readSource("src/app/@modal/(.)systemes/[slug]/processus/page.tsx"),
      readSource("src/components/SystemProcessesRouteDialog.tsx"),
      readSource("src/components/SystemProcessesEmailDialog.tsx"),
      readSource("src/app/api/system-processes/email/route.ts"),
      readSource("src/app/globals.css"),
    ]);

    expect(printButtonSource).toContain('typeof window.print === "function"');
    expect(printButtonSource).toContain("Copier le lien");
    expect(printButtonSource).toContain("Chrome, Safari ou Firefox");
    expect(printButtonSource).toContain("flex-nowrap");
    expect(printButtonSource).toContain("Imprimer / PDF");
    expect(printButtonSource).toContain("Recevoir par e-mail");
    expect(processesPageSource).toContain("<SystemProcessesContent");
    expect(processesContentSource).toContain("data-system-processes");
    expect(processesContentSource).toContain("Liste des processus");
    expect(processesContentSource).toContain("border-dema-forest/45");
    expect(processesContentSource).not.toContain('<span aria-hidden="true">•</span>');
    expect(processesContentSource).not.toContain("Solutions");
    expect(processesContentSource).not.toContain("Ressources");
    expect(processesModalSource).toContain("<SystemProcessesRouteDialog");
    expect(processesModalSource).toContain('variant="modal"');
    expect(processesDialogSource).toContain("router.back()");
    expect(processesDialogSource).toContain("DirectoryDetailDialogShell");
    expect(processesEmailDialogSource).toContain("Recevoir cette checklist");
    expect(processesEmailDialogSource).toContain('className="whitespace-nowrap">par e-mail</span>');
    expect(processesEmailDialogSource).toContain("Cet envoi ne vous inscrit à aucune communication marketing.");
    expect(processesEmailRouteSource).toContain("buildSystemProcessesPdf");
    expect(processesEmailRouteSource).toContain("sendSystemProcessesPdfEmail");
    expect(processesEmailRouteSource).toContain("enforceSameOrigin");
    expect(processesEmailRouteSource).toContain("enforceRateLimit");
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

  it("keeps the public métier page linear and exposes processes once through a direct bridge", async () => {
    const detailSource = await readSource(
      "src/components/SystemDetailContent.tsx",
    );

    expect(detailSource).not.toContain('role="tablist"');
    expect(detailSource).not.toContain('role="tab"');
    expect(detailSource).not.toContain("SystemeTabContent");
    expect(detailSource).toContain("<SystemSolutionsTab");
    expect(detailSource).not.toContain("<SystemResourcesTab");
    expect(detailSource).toContain('href={`/systemes/${system.slug}/processus`}');
    expect(detailSource).not.toContain("<SystemSolutionNextSteps");
  });
});
