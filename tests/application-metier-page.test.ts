import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("Application métier landing page", () => {
  it("publishes Sur mesure as the canonical route and redirects the retained alias", async () => {
    const [pageSource, legacyPageSource, catalogSource] = await Promise.all([
      readSource("src/app/(marketing)/sur-mesure/page.tsx"),
      readSource("src/app/(marketing)/application-metier/page.tsx"),
      readSource("src/lib/canonical-service-catalog.ts"),
    ]);

    expect(pageSource).toContain('path: "/sur-mesure"');
    expect(pageSource).not.toContain("robots: { index: false, follow: false }");
    expect(pageSource).toContain("buildPublicPageMetadata");
    expect(pageSource).toContain('"@type": "FAQPage"');
    expect(pageSource).toContain("buildServicePageJsonLd(service)");
    expect(pageSource).toContain("<ApplicationMetierLandingPage offer={offer} />");
    expect(legacyPageSource).toContain('permanentRedirect("/sur-mesure")');
    expect(catalogSource).toContain('detailHref: "/sur-mesure"');
  });

  it("uses the explicit promise, detailed illustrations, and complete section hierarchy", async () => {
    const [source, content, diagnosticSource, diagnosticControlSource] = await Promise.all([
      readSource("src/components/ApplicationMetierLandingPage.tsx"),
      readSource("src/lib/sur-mesure-page-content.ts"),
      readSource("src/components/ApplicationDiagnosticExperience.tsx"),
      readSource("src/components/GuestDiagnosticControl.tsx"),
    ]);

    expect(content).toContain("Nous créons votre logiciel métier sur mesure.");
    expect(source).toContain("Nous créons votre logiciel métier");
    expect(source).toContain("sur mesure.");
    expect(source).not.toContain("eyebrow");
    expect(source).toContain("logiciel-metier-sur-mesure-v8.png");
    expect(source).toContain("/images/accompagnement/atelier-organisation-afro.png");
    expect(source).toContain("Des logiciels construits pour des situations concrètes");
    expect(source).toContain("step.description");
    expect(source).not.toContain("content.fit");
    expect(source).toContain("Ce qui est inclus");
    expect(source).toContain("700 € HT / jour");
    expect(source).toContain("Questions fréquentes");
    expect(diagnosticSource).toContain('label = "Discuter de mon projet"');
    expect(diagnosticSource).toContain('dialogTitle="Discuter de mon projet"');
    expect(diagnosticSource).toContain("si une application métier est adaptée");
    expect(diagnosticSource).toContain("<ClipboardCheck");
    expect(diagnosticSource).toContain("showCallbackAvailability");
    expect(diagnosticSource).toContain("showNavbarTrigger={false}");
    expect(diagnosticControlSource).toContain("Disponibilités pour un rappel");
    expect(diagnosticControlSource).toContain('name="callbackAvailability"');
    expect(diagnosticSource).toContain("requirePhone");
    expect(diagnosticControlSource).not.toContain('Disponibilités pour un rappel <span');
    expect(source).toContain('<Navbar minimal publicNavigationActiveView="services" />');
  });

  it("presents three real anonymized cases without mixing them with Studio", async () => {
    const [source, component, cases] = await Promise.all([
      readSource("src/components/ApplicationMetierLandingPage.tsx"),
      readSource("src/components/ApplicationMetierCaseStudies.tsx"),
      readSource("src/lib/application-metier-case-studies.ts"),
    ]);

    expect(source).toContain('className="border-y border-dema-line bg-dema-paper');
    expect(source).toContain('className="bg-dema-sage');
    expect(source).toContain("ApplicationMetierCaseStudies");
    expect(source).toContain("APPLICATION_METIER_CASE_STUDIES");
    expect(source).not.toContain("DEMAA_STUDIO_PROJECTS");
    expect(source).not.toContain("Tiimora");
    expect(source).not.toContain("Oryka");
    expect(source).not.toContain("Revyo");

    expect(cases).toContain('sector: "Entreprise du bâtiment"');
    expect(cases).toContain("chantiers et organiser le planning des collaborateurs");
    expect(cases).toContain('sector: "Entreprise de nettoyage"');
    expect(cases).toContain("Arrivée et départ pointés");
    expect(cases).toContain('sector: "Cabinet d’expertise comptable"');
    expect(cases).toContain("attribuer un responsable");
    expect(cases).toContain("partager l’avancement avec le client");
    expect(cases).not.toContain("Tiimora");
    expect(cases).not.toContain("Oryka");
    expect(cases).not.toContain("Revyo");
    expect(cases).not.toContain("Tendera");

    expect(component).toContain("DirectoryDetailDialogShell");
    expect(component).toContain("Le problème de départ");
    expect(component).toContain("L’application construite");
    expect(component).toContain("Le flux de travail");
    expect(component).toContain("Découvrir le cas concret");
    expect(component).not.toContain("CaseStudyPreview");
    expect(cases).not.toContain("preview:");
    expect(component).not.toContain("Projet réalisé");
    expect(component).not.toContain("next/image");
  });
});
