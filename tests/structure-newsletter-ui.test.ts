import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  STRUCTURE_NEWSLETTER_NAME,
  STRUCTURE_NEWSLETTER_PROMISE,
  STRUCTURE_PUBLICATION_CONSENT,
  STRUCTURE_WORK_SESSION_DURATION_MINUTES,
  STRUCTURE_VOICE_SUBMISSION,
} from "@/lib/structure-newsletter-contract";

const read = (path: string) => readFileSync(path, "utf8");

describe("Organiser newsletter public contract", () => {
  const component = read("src/components/StructureNewsletterBlock.tsx");
  const problemForm = read("src/components/StructureProblemSubmissionForm.tsx");

  it("keeps one exact editorial promise and a direct subscription", () => {
    expect(STRUCTURE_NEWSLETTER_NAME).toBe("Structurer.");
    expect(STRUCTURE_NEWSLETTER_PROMISE).toBe(
      "Tous les quinze jours, Demaa part d’une problématique réelle et partage les processus, les outils et les décisions utiles pour mieux structurer votre activité.",
    );
    expect(component).toContain('fetch("/api/newsletter-subscribe"');
    expect(component).toContain("S’abonner");
    expect(component).toContain("Proposer mon cas");
    expect(STRUCTURE_WORK_SESSION_DURATION_MINUTES).toBe(45);
    expect(component).not.toContain("La lettre Demaa");
  });

  it("keeps both Organiser forms public with an explicit contact email", () => {
    expect(component).toContain('intent === "structure-problem"');
    expect(component).toContain("setIsProblemOpen(true)");
    expect(component).toContain('id="structure-newsletter-email"');
    expect(problemForm).toContain('id="structure-contact-email"');
    expect(component).not.toContain("CustomerSpaceAccessForm");
    expect(problemForm).not.toContain("CustomerSpaceAccessForm");
  });

  it("requires the versioned publication consent", () => {
    expect(STRUCTURE_PUBLICATION_CONSENT).toEqual({
      purpose: "structure_case_publication",
      text: "J’accepte qu’une synthèse anonymisée de mon cas, validée avec moi, soit publiée dans Structurer.",
      version: "structure-case-publication-v5",
    });
    expect(problemForm).toContain("Session de travail offerte");
    expect(problemForm).toContain("45 minutes pour structurer un problème concret");
    expect(problemForm).toContain("nous vous envoyons une synthèse claire");
    expect(problemForm).not.toContain("Toutes les propositions ne pourront pas être retenues");
    expect(problemForm).toContain("Sur quoi avez-vous besoin d’aide ?");
    expect(problemForm.replace(/\s+/g, " ")).toContain(
      "sa version anonymisée destinée à la newsletter",
    );
  });

  it("reuses the same submission form in the modal and on a shareable page", () => {
    const directPage = read("src/app/(marketing)/session-structurer/page.tsx");

    expect(component).toContain("<StructureProblemSubmissionForm onClose={closeProblem} />");
    expect(directPage).toContain("<StructureProblemSubmissionForm />");
    expect(directPage).toContain('path: "/session-structurer"');
    expect(read("src/app/sitemap.ts")).toContain("`${base}/session-structurer`");
  });

  it("renders the same component at the approved editorial surfaces only", () => {
    const approved = [
      "src/components/AcademyIndexClient.tsx",
      "src/components/SystemsHubPage.tsx",
      "src/components/MentoratAutomationLandingPage.tsx",
      "src/app/(marketing)/modeles/page.tsx",
    ];

    for (const path of approved) {
      expect(read(path)).toContain("<StructureNewsletterBlock />");
    }

    const academyIndex = read("src/components/AcademyIndexClient.tsx");
    expect(academyIndex).toContain("!embedded || showStructureNewsletter");
    expect(component).toContain("mx-auto w-full max-w-4xl");
    expect(read("src/components/SystemDetailContent.tsx")).not.toContain(
      "StructureNewsletterBlock",
    );
    const archivedOrganiserLanding = read("src/components/OrganiserLandingPage.tsx");
    expect(archivedOrganiserLanding).toContain("<StructureNewsletterBlock />");
    expect(read("src/app/(marketing)/organiser/page.tsx")).not.toContain(
      "OrganiserLandingPage",
    );
    const sharedPageLoader = read("src/lib/action-plan-pages.server.ts");
    expect(sharedPageLoader).toContain('requestedIntent === "structure"');
    expect(sharedPageLoader).toContain('requestedIntent === "structure-problem"');
    expect(sharedPageLoader).toContain('input.localeCode === "fr"');

    const academyCourseFiles = [
      "src/app/(marketing)/organiser/[slug]/page.tsx",
      "src/components/AcademyCourseReader.tsx",
    ].filter((path) => {
      try {
        read(path);
        return true;
      } catch {
        return false;
      }
    });
    for (const path of academyCourseFiles) {
      expect(read(path)).not.toContain("StructureNewsletterBlock");
    }
  });

  it("keeps voice collection closed and hidden until its secure lifecycle exists", () => {
    expect(STRUCTURE_VOICE_SUBMISSION).toMatchObject({
      enabled: false,
      maximumDurationSeconds: 120,
      recordingRetentionDays: 30,
    });
    expect(component).not.toContain("STRUCTURE_VOICE_SUBMISSION");
    expect(component).not.toContain("Message vocal");
    expect(component).not.toContain("<Mic");
  });
});
