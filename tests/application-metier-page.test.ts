import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("Application métier landing page", () => {
  it("owns the new canonical route and structured data", async () => {
    const [pageSource, catalogSource] = await Promise.all([
      readSource("src/app/(marketing)/application-metier/page.tsx"),
      readSource("src/lib/canonical-service-catalog.ts"),
    ]);

    expect(pageSource).toContain('canonical: "/application-metier"');
    expect(pageSource).toContain('url: "/application-metier"');
    expect(pageSource).toContain('"@type": "FAQPage"');
    expect(pageSource).toContain("buildServicePageJsonLd(service)");
    expect(catalogSource).toContain('detailHref: "/application-metier"');
  });

  it("keeps the approved short promise and section hierarchy", async () => {
    const [source, diagnosticSource, diagnosticControlSource] = await Promise.all([
      readSource("src/components/ApplicationMetierLandingPage.tsx"),
      readSource("src/components/ApplicationDiagnosticExperience.tsx"),
      readSource("src/components/GuestDiagnosticControl.tsx"),
    ]);

    expect(source).toContain("Gagnez du temps");
    expect(source).toContain("et rendez votre entreprise plus autonome.");
    expect(source).toContain(
      'aria-label="Gagnez du temps et rendez votre entreprise plus autonome."',
    );
    expect(source).toContain("Qu’est-ce qu’une application métier change dans votre quotidien ?");
    expect(source).toContain("Moins de tâches chronophages");
    expect(source).toContain("Tout est centralisé");
    expect(source).toContain("Chacun sait quoi faire");
    expect(source).not.toContain("block h-0.5 w-8 rounded-full bg-dema-forest");
    expect(source).toContain("Comment ça se passe concrètement ?");
    expect(source).not.toContain("ArrowRight");
    expect(source).toContain("Des applications construites pour des situations concrètes");
    expect(source).toContain("Trois projets réalisés autour du fonctionnement réel d’une entreprise.");
    expect(source).toContain('<span className="block">À partir de</span>');
    expect(source).toContain('<span className="mt-1 block whitespace-nowrap">4 500 € HT</span>');
    expect(source).toContain("700 € HT / jour");
    expect(source).toContain("Questions-réponses");
    expect(diagnosticSource).toContain('label = "Discuter de votre projet"');
    expect(diagnosticSource).toContain('dialogTitle="Discuter de votre projet"');
    expect(diagnosticSource).toContain("si une application métier est adaptée");
    expect(diagnosticSource).toContain("<ClipboardCheck");
    expect(diagnosticSource).toContain("showCallbackAvailability");
    expect(diagnosticSource).toContain("showNavbarTrigger={false}");
    expect(diagnosticControlSource).toContain("Disponibilités pour un rappel");
    expect(diagnosticControlSource).toContain('name="callbackAvailability"');
    expect(diagnosticControlSource).not.toContain('Disponibilités pour un rappel <span');
    expect(source).toContain("<Navbar minimal showDiagnostic={false} />");
  });

  it("presents three real anonymized cases without mixing them with Studio", async () => {
    const [source, component, cases] = await Promise.all([
      readSource("src/components/ApplicationMetierLandingPage.tsx"),
      readSource("src/components/ApplicationMetierCaseStudies.tsx"),
      readSource("src/lib/application-metier-case-studies.ts"),
    ]);

    expect(source).toContain('className="bg-dema-forest');
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
    expect(component).not.toContain("Projet réalisé");
    expect(component).not.toContain("next/image");
  });
});
