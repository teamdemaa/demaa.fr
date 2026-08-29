import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MentoratAutomationDiagnostic from "@/components/MentoratAutomationDiagnostic";
import MentoratAutomationCta from "@/components/MentoratAutomationCta";
import {
  AUTOMATION_ACCOMPANIMENT_PATH,
  mentoratAutomationContent,
} from "@/lib/mentorat-automation-content";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("Accompagnement à l’automatisation", () => {
  it("locks the two-month offer at 3 500 € HT without prescribing session content", () => {
    expect(AUTOMATION_ACCOMPANIMENT_PATH).toBe("/automatisation");
    expect(mentoratAutomationContent.offer.duration).toBe("2 mois");
    expect(mentoratAutomationContent.offer.price).toBe("3 500 € HT");
    expect(mentoratAutomationContent.hero.description).toContain("nous partons de votre travail réel");
    expect("sessions" in mentoratAutomationContent).toBe(false);

    const markup = renderToStaticMarkup(
      createElement(MentoratAutomationCta, { variant: "general" }),
    );
    expect(markup).toContain("2 mois");
    expect(markup).toContain("réduire les ressaisies");
    expect(markup).not.toContain("3 500 € HT");
    expect(markup).not.toContain("8 séances");
    expect(markup).not.toContain("Accompagnement personnalisé sur 2 mois");
    expect(markup).not.toContain("première automatisation");
    expect(markup).not.toContain("lucide-sparkles");
    expect(markup).toContain(
      "/automatisation?source=solutions-hub",
    );
  });

  it("presents the diagnostic as a dedicated starting-point section", () => {
    const diagnosticMarkup = renderToStaticMarkup(
      createElement(MentoratAutomationDiagnostic),
    );

    expect(diagnosticMarkup).toContain("Qu’est-ce qui vous prend le plus de temps aujourd’hui");
    expect(diagnosticMarkup).toContain("Identifier mon point de départ");
    expect(diagnosticMarkup).not.toContain("Diagnostic IA");
    expect(diagnosticMarkup).not.toContain("3 500 € HT");
    expect(diagnosticMarkup).not.toContain("8 séances");
  });

  it("contextualizes métier and model entry points", () => {
    const métierMarkup = renderToStaticMarkup(
      createElement(MentoratAutomationCta, {
        systemName: "Cabinet comptable",
        systemSlug: "cabinet-comptable",
        variant: "metier",
      }),
    );
    const modelMarkup = renderToStaticMarkup(
      createElement(MentoratAutomationCta, {
        modelSlug: "structure-google-drive-entreprise",
        variant: "modele",
      }),
    );

    expect(métierMarkup).toContain("Cabinet comptable");
    expect(métierMarkup).toContain("tâches répétitives");
    expect(métierMarkup).toContain("source=solution-metier");
    expect(métierMarkup).toContain("systemSlug=cabinet-comptable");
    expect(modelMarkup).toContain("Passez du modèle à l’automatisation");
    expect(modelMarkup).toContain("première façon de travailler");
    expect(modelMarkup).toContain("source=modele-detail");
    expect(modelMarkup).toContain("modelSlug=structure-google-drive-entreprise");
  });

  it("places the CTA on every requested public surface and retires customization", async () => {
    const [hub, landingPage, callbackControl, callbackDialog, automationCases, caseStudiesComponent, systemPage, modelsPage, modelDetails, sitemap, nextConfig] =
      await Promise.all([
        readSource("src/components/SystemsHubPage.tsx"),
        readSource("src/components/MentoratAutomationLandingPage.tsx"),
        readSource("src/components/AutomationCallbackControl.tsx"),
        readSource("src/components/AutomationCallbackDialog.tsx"),
        readSource("src/lib/automation-case-studies.ts"),
        readSource("src/components/ApplicationMetierCaseStudies.tsx"),
        readSource("src/app/(marketing)/solutions/[slug]/page.tsx"),
        readSource("src/app/(marketing)/modeles/page.tsx"),
        readSource("src/components/CopyableModelDetails.tsx"),
        readSource("src/app/sitemap.ts"),
        readSource("next.config.ts"),
      ]);

    expect(hub).toContain('<MentoratAutomationCta variant="general" />');
    expect(hub).toContain("<StructureNewsletterBlock />");
    expect(hub.indexOf('<MentoratAutomationCta variant="general" />')).toBeLessThan(
      hub.indexOf("<StructureNewsletterBlock />"),
    );
    expect(landingPage).not.toContain("Séance 1");
    expect(landingPage).not.toContain("Huit séances");
    expect(landingPage).not.toContain("Lancer mon diagnostic");
    expect(landingPage).not.toContain("Mentorat Automatisation & IA");
    expect(landingPage).toContain("publicCta={<AutomationCallbackControl />}");
    expect(landingPage).toContain('publicNavigationActiveView="services"');
    expect(landingPage).toContain("<StructureNewsletterBlock />");
    expect(callbackControl).toContain("Discuter de mon besoin");
    expect(callbackControl).toContain("AutomationCallbackDialog");
    expect(callbackDialog).toContain("Demander à être rappelé");
    expect(callbackDialog).toContain("<ServiceCallbackForm");
    expect(await readSource("src/components/ServiceCallbackForm.tsx")).toContain(
      "font-normal text-brand-blue outline-none transition placeholder:text-dema-muted/50",
    );
    expect(landingPage).toContain("Le problème n’est pas le nombre d’outils.");
    expect(landingPage).toContain("C’est tout ce qui se passe entre eux.");
    expect(landingPage).toContain("Une demande arrive");
    expect(landingPage).toContain("La bonne personne est prévenue");
    expect(landingPage).toContain("Pour le dirigeant et la personne qui fera fonctionner les automatisations");
    expect(landingPage).not.toContain("Ce qui change concrètement");
    expect(landingPage).not.toContain("SOLUTION_RAIL_CLASS_NAME");
    expect(mentoratAutomationContent.outcomes[0].title).toBe("Moins de ressaisies et de relances");
    expect(mentoratAutomationContent.included).toContain(
      "Le passage du cadrage à la mise en service dans votre environnement de travail",
    );
    expect(landingPage).toContain("Aucun profil technique n’est nécessaire");
    expect(landingPage).toContain('variant="automation"');
    expect(automationCases).toContain('sector: "Cabinet d’expertise comptable"');
    expect(automationCases).toContain('sector: "Entreprise du bâtiment"');
    expect(automationCases).toContain('sector: "Maintenance d’ascenseurs"');
    expect(automationCases).toContain("25 % de temps gagné pour le collaborateur comptable");
    expect(automationCases).toContain("30 % de temps gagné pour le gestionnaire de paie");
    expect(automationCases).toContain("30 % de temps gagné pour le conducteur de travaux");
    expect(automationCases).toContain("25 % de temps gagné pour le gestionnaire technique");
    expect(caseStudiesComponent).toContain("L’automatisation mise en place");
    expect(caseStudiesComponent).toContain("Résultats observés sur les tâches concernées");
    expect(landingPage).toContain("Trois situations accompagnées sur le terrain.");
    expect(landingPage).toContain("Ces entreprises sont anonymisées.");
    expect(landingPage).toContain("les tâches retenues sont simplifiées ou automatisées");
    expect(landingPage).not.toContain("Le contenu est défini après le diagnostic");
    expect(landingPage.indexOf('aria-labelledby="results-heading"')).toBeLessThan(
      landingPage.indexOf('aria-labelledby="automation-problem-heading"'),
    );
    expect(landingPage.indexOf('aria-labelledby="automation-problem-heading"')).toBeLessThan(
      landingPage.indexOf('aria-labelledby="automation-cases-heading"'),
    );
    expect(landingPage.indexOf('aria-labelledby="automation-cases-heading"')).toBeLessThan(
      landingPage.indexOf('aria-labelledby="automation-audience-heading"'),
    );
    expect(landingPage.indexOf('aria-labelledby="automation-audience-heading"')).toBeLessThan(
      landingPage.indexOf("<MentoratAutomationDiagnostic />"),
    );
    expect(landingPage.indexOf("<MentoratAutomationDiagnostic />")).toBeLessThan(
      landingPage.indexOf('aria-labelledby="offer-heading"'),
    );
    expect(landingPage.indexOf('aria-labelledby="offer-heading"')).toBeLessThan(
      landingPage.indexOf('aria-labelledby="scope-heading"'),
    );
    expect(systemPage).toContain('variant="metier"');
    expect(modelsPage).toContain('<MentoratAutomationCta variant="modele" />');
    expect(modelsPage).toContain("<StructureNewsletterBlock />");
    expect(modelsPage.indexOf('<MentoratAutomationCta variant="modele" />')).toBeLessThan(
      modelsPage.indexOf("<StructureNewsletterBlock />"),
    );
    expect(modelDetails).toContain('variant="modele"');
    expect(modelDetails).not.toContain("Adaptation sur mesure");
    expect(modelDetails).not.toContain("Faire adapter ce modèle");
    expect(sitemap).toContain("/automatisation");
    expect(sitemap).not.toContain("`${base}/application-metier`");
    expect(nextConfig).toContain("source: '/services/automatisation-processus'");
    expect(nextConfig).toContain("destination: '/automatisation'");
  });
});
