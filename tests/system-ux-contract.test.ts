import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("system UX contract", () => {
  it("separates direct models, available guides and future-guide notifications", async () => {
    const detailSource = await readSource(
      "src/components/SystemDetailContent.tsx",
    );
    const resourcesSource = await readSource(
      "src/components/SystemResourcesTab.tsx",
    );
    const modelCardSource = await readSource(
      "src/components/ModelResourceCard.tsx",
    );
    const guidesSource = await readSource(
      "src/components/SystemGuidesRail.tsx",
    );
    const slidesSource = await readSource(
      "src/components/GuideSlidesDialog.tsx",
    );
    const notifySource = await readSource(
      "src/components/GuideNotifyModal.tsx",
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
    expect(detailSource).toContain('resource.format === "guide"');
    expect(detailSource).toContain('resource.format === "template"');
    expect(detailSource).not.toContain("OperationalSystemCopyRequestModal");
    expect(resourcesSource).toContain("<ModelResourceCard resource={resource}");
    expect(resourcesSource).not.toContain("selectedResource");
    expect(modelCardSource).toContain(
      "`/api/systeme-kit/open/${resource.resourceSlug}`",
    );
    expect(modelCardSource).toContain('target="_blank"');
    expect(guidesSource).toContain('resource.availability === "available"');
    expect(guidesSource).toContain("<GuideSlidesDialog");
    expect(guidesSource).toContain("Bientôt disponible");
    expect(guidesSource).toContain("Être informé");
    expect(guidesSource).toContain("<GuideNotifyModal");
    expect(slidesSource).not.toContain("Télécharger le PDF");
    expect(slidesSource).not.toContain("downloadHref");
    expect(slidesSource).toContain('event.key === "ArrowRight"');
    expect(slidesSource).toContain('event.key === "ArrowLeft"');
    expect(notifySource).toContain('fetch("/api/systeme-kit/notify"');
    expect(notifySource).toContain("Ce n’est pas une inscription à une newsletter.");
    expect(notifySource).toContain("M’informer");
    expect(notifySource).not.toContain('name="marketingConsent"');
    expect(notifySource).not.toContain("Prénom");
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
