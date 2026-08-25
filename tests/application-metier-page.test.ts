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
    const [source, diagnosticSource] = await Promise.all([
      readSource("src/components/ApplicationMetierLandingPage.tsx"),
      readSource("src/components/ApplicationDiagnosticExperience.tsx"),
    ]);

    expect(source).toContain("Gagnez du temps");
    expect(source).toContain("et rendez votre entreprise plus autonome.");
    expect(source).toContain("Qu’est-ce qu’une application métier change dans votre quotidien ?");
    expect(source).toContain("Moins de tâches chronophages");
    expect(source).toContain("Tout est centralisé");
    expect(source).toContain("Chacun sait quoi faire");
    expect(source).not.toContain("block h-0.5 w-8 rounded-full bg-dema-forest");
    expect(source).toContain("Comment ça se passe concrètement ?");
    expect(source).not.toContain("ArrowRight");
    expect(source).toContain("Certaines applications réalisées par notre équipe");
    expect(source).toContain('<span className="block">À partir de</span>');
    expect(source).toContain('<span className="mt-1 block whitespace-nowrap">4 500 € HT</span>');
    expect(source).toContain("700 € HT / jour");
    expect(source).toContain("Questions-réponses");
    expect(diagnosticSource).toContain("Diagnostic organisation");
    expect(diagnosticSource).toContain("<ClipboardCheck");
    expect(diagnosticSource).toContain("showNavbarTrigger={false}");
    expect(source).toContain("<Navbar minimal showDiagnostic={false} />");
  });

  it("uses the real brand colors and links the three verified public projects", async () => {
    const source = await readSource("src/components/ApplicationMetierLandingPage.tsx");

    expect(source).toContain('className="bg-dema-forest');
    expect(source).toContain('className="bg-dema-sage');
    expect(source).toContain('href: "https://www.tiimora.com/"');
    expect(source).toContain('href: "https://pointage-2.vercel.app/"');
    expect(source).toContain('href: "https://revio-gules.vercel.app/"');
    expect(source).toContain('logo: "/portfolio/tiimora-logo.svg"');
    expect(source).toContain('logo: "/portfolio/oryka-logo.svg"');
    expect(source).toContain('logo: "/portfolio/revyo-logo.svg"');
    expect(source).toContain('name: "Oryka"');
    expect(source).toContain('name: "Revyo"');
    expect(source).not.toContain("Tendera");
  });
});
