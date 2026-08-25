import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  STRUCTURE_NEWSLETTER_NAME,
  STRUCTURE_NEWSLETTER_PROMISE,
  STRUCTURE_PUBLICATION_CONSENT,
  STRUCTURE_VOICE_SUBMISSION,
} from "@/lib/structure-newsletter-contract";

const read = (path: string) => readFileSync(path, "utf8");

describe("Organiser newsletter public contract", () => {
  const component = read("src/components/StructureNewsletterBlock.tsx");

  it("keeps one exact editorial promise and a direct subscription", () => {
    expect(STRUCTURE_NEWSLETTER_NAME).toBe("Organiser.");
    expect(STRUCTURE_NEWSLETTER_PROMISE).toBe(
      "Tous les quinze jours, l’équipe Demaa étudie une problématique réelle d’entreprise et construit une réponse concrète, utile à tous.",
    );
    expect(component).toContain('fetch("/api/newsletter-subscribe"');
    expect(component).toContain("S’abonner");
    expect(component).toContain("Proposer ma problématique");
    expect(component).not.toContain("La lettre Demaa");
  });

  it("keeps both Organiser forms public with an explicit contact email", () => {
    expect(component).toContain('intent === "structure-problem"');
    expect(component).toContain("setIsProblemOpen(true)");
    expect(component).toContain('id="structure-newsletter-email"');
    expect(component).toContain('id="structure-contact-email"');
    expect(component).not.toContain("CustomerSpaceAccessForm");
  });

  it("requires the versioned publication consent", () => {
    expect(STRUCTURE_PUBLICATION_CONSENT).toEqual({
      purpose: "structure_case_publication",
      text: "J’accepte que mon entreprise, mon site et ma problématique soient présentés dans Organiser si ma proposition est sélectionnée.",
      version: "structure-case-publication-v2",
    });
    expect(component.replace(/\s+/g, " ")).toContain(
      "Toutes les propositions ne pourront pas être traitées",
    );
    expect(component.replace(/\s+/g, " ")).toContain(
      "l’équipe vous contactera avant toute publication",
    );
  });

  it("renders the same component at the three approved surfaces only", () => {
    const approved = [
      "src/components/SystemDetailContent.tsx",
      "src/components/AcademyIndexClient.tsx",
      "src/app/(marketing)/sur-mesure/page.tsx",
    ];

    for (const path of approved) {
      expect(read(path)).toContain("<StructureNewsletterBlock />");
    }

    const academyIndex = read("src/components/AcademyIndexClient.tsx");
    expect(academyIndex).toContain("!embedded || showStructureNewsletter");
    const sharedPageLoader = read("src/lib/action-plan-pages.server.ts");
    expect(sharedPageLoader).toContain('requestedIntent === "structure"');
    expect(sharedPageLoader).toContain('requestedIntent === "structure-problem"');
    expect(sharedPageLoader).toContain('input.localeCode === "fr"');

    const academyCourseFiles = [
      "src/app/(marketing)/academie/[courseSlug]/page.tsx",
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
