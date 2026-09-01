import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MentoratAutomationDiagnostic from "@/components/MentoratAutomationDiagnostic";
import MentoratAutomationCta from "@/components/MentoratAutomationCta";
import { AUTOMATION_OFFER } from "@/lib/automation-offer";
import {
  AUTOMATION_ACCOMPANIMENT_PATH,
  mentoratAutomationContent,
} from "@/lib/mentorat-automation-content";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("Formation automatisation et IA", () => {
  it("locks the eight-week offer at 3 500 € HT for company teams", () => {
    expect(AUTOMATION_ACCOMPANIMENT_PATH).toBe("/automatisation");
    expect(mentoratAutomationContent.offer.duration).toBe("2 mois");
    expect(mentoratAutomationContent.offer.price).toBe("3 500 € HT");
    expect(AUTOMATION_OFFER.name).toBe("Accompagnement à l’automatisation");
    expect(AUTOMATION_OFFER.summary).toContain("automatiser ce qui leur fait perdre du temps");
    expect(mentoratAutomationContent.hero.description).toContain("vos équipes apprennent");
    expect(mentoratAutomationContent.hero.title).toBe(
      "Faites gagner du temps à vos équipes avec l’automatisation et l’IA.",
    );
    expect("sessions" in mentoratAutomationContent).toBe(false);

    const markup = renderToStaticMarkup(
      createElement(MentoratAutomationCta, { variant: "general" }),
    );
    expect(markup).toContain("2 mois");
    expect(markup).toContain("vos équipes apprennent avec un mentor");
    expect(markup).toContain("Faites gagner du temps à vos équipes");
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
    expect(métierMarkup).toContain("automatiser les étapes inutiles");
    expect(métierMarkup).toContain("source=solution-metier");
    expect(métierMarkup).toContain("systemSlug=cabinet-comptable");
    expect(modelMarkup).toContain("Faites évoluer ce modèle avec votre équipe");
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
    expect(landingPage).not.toContain("publicCta={<AutomationCallbackControl />}");
    expect(landingPage).toContain('<div className="mt-8 flex justify-center">');
    expect(landingPage.indexOf("{content.hero.description}")).toBeLessThan(
      landingPage.indexOf('variant="hero"'),
    );
    expect(landingPage).not.toContain("<AutomationProfessionalsPanel />");
    expect(landingPage).toContain('publicNavigationActiveView="services"');
    expect(landingPage).toContain("<StructureNewsletterBlock />");
    expect(callbackControl).toContain("Discuter de mon besoin");
    expect(callbackControl).toContain("AutomationCallbackDialog");
    expect(callbackDialog).toContain("Demander à être rappelé");
    expect(callbackDialog).toContain("Accompagnement à l’automatisation");
    expect(callbackDialog).toContain("comprendre vos priorités");
    expect(callbackDialog).not.toContain("projet d’outil interne");
    expect(callbackDialog).toContain("<ServiceCallbackForm");
    expect(await readSource("src/components/ServiceCallbackForm.tsx")).toContain(
      "font-normal text-brand-blue outline-none transition placeholder:text-dema-muted/50",
    );
    expect(landingPage).toContain("Faites gagner du temps à vos équipes");
    expect(landingPage).toContain("avec l’automatisation et l’IA.");
    expect(landingPage).not.toContain("Un besoin concret.");
    expect(landingPage).toContain("Ce qu’ils en retiennent.");
    expect(landingPage).toContain(
      "Un accompagnement qui suit les priorités de vos équipes.",
    );
    expect(landingPage).toContain("Ce que vos équipes peuvent mettre en place.");
    expect(landingPage).toContain(
      "Des tutoriels précis pour apprendre en faisant.",
    );
    expect(landingPage).toContain("De nouveaux contenus sont ajoutés et partagés");
    expect(landingPage).not.toContain("Codex au centre");
    expect(landingPage).not.toContain("notre stack");
    expect(landingPage).not.toContain("Les outils avec lesquels nous travaillons");
    expect(mentoratAutomationContent.workingRhythm.map((step) => step.title)).toEqual([
      "Chaque semaine",
      "Entre les rendez-vous",
      "Selon vos besoins",
    ]);
    expect(mentoratAutomationContent.academyTopics.map((topic) => topic.title)).toEqual([
      "Trouver quoi automatiser",
      "ChatGPT et Codex",
      "Airtable et Fillout",
      "Make",
      "Faire évoluer ses systèmes",
    ]);
    expect(mentoratAutomationContent.examples).toHaveLength(6);
    expect(mentoratAutomationContent.examples).toContain(
      "Automatiser les saisies, les relances et les notifications",
    );
    expect(mentoratAutomationContent.testimonials).toHaveLength(3);
    expect(mentoratAutomationContent.testimonials.map((item) => item.attribution)).toEqual([
      "Chef de mission comptable",
      "Assistante de direction · Entreprise du bâtiment",
      "Product Builder",
    ]);
    expect(mentoratAutomationContent.testimonials[0].quote).toContain("30 % de temps");
    expect(automationCases).toContain('sector: "Cabinet d’expertise comptable"');
    expect(automationCases).toContain('sector: "Entreprise du bâtiment"');
    expect(automationCases).toContain('sector: "Maintenance d’ascenseurs"');
    expect(automationCases).toContain("25 % de temps gagné pour le collaborateur comptable");
    expect(automationCases).toContain("30 % de temps gagné pour le gestionnaire de paie");
    expect(automationCases).toContain("30 % de temps gagné pour le conducteur de travaux");
    expect(automationCases).toContain("25 % de temps gagné pour le gestionnaire technique");
    expect(caseStudiesComponent).toContain("L’automatisation mise en place");
    expect(caseStudiesComponent).toContain("Résultats observés sur les tâches concernées");
    expect(landingPage).toContain("L’accompagnement");
    expect(landingPage).toContain("en bref.");
    expect(mentoratAutomationContent.offerIncludes).toHaveLength(4);
    expect(landingPage).not.toContain("Le contenu est défini après le diagnostic");
    expect(landingPage.indexOf('aria-labelledby="proof-heading"')).toBeLessThan(
      landingPage.indexOf('aria-labelledby="journey-heading"'),
    );
    expect(landingPage.indexOf('aria-labelledby="journey-heading"')).toBeLessThan(
      landingPage.indexOf('aria-labelledby="examples-heading"'),
    );
    expect(landingPage.indexOf('aria-labelledby="examples-heading"')).toBeLessThan(
      landingPage.indexOf('aria-labelledby="academy-heading"'),
    );
    expect(landingPage.indexOf('aria-labelledby="academy-heading"')).toBeLessThan(
      landingPage.indexOf('aria-labelledby="offer-heading"'),
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
