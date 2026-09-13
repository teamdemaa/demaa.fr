import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

function expectInOrder(content: string, labels: readonly string[]) {
  let previousIndex = -1;
  for (const label of labels) {
    const index = content.indexOf(label);
    expect(index, `Missing form marker: ${label}`).toBeGreaterThan(-1);
    expect(index, `Expected ${label} after the previous form marker`).toBeGreaterThan(previousIndex);
    previousIndex = index;
  }
}

describe("public qualification forms", () => {
  it("asks for the Diagnostic situation before contact details", () => {
    const diagnostic = source("src/components/GuestDiagnosticControl.tsx");

    expectInOrder(diagnostic, [
      "Qu’est-ce qui vous prend trop de temps aujourd’hui ?",
      "Adresse e-mail",
      "Téléphone",
    ]);
    expect(diagnostic.indexOf("data-dialog-initial-focus")).toBeGreaterThan(
      diagnostic.indexOf("Qu’est-ce qui vous prend trop de temps aujourd’hui ?"),
    );
    expect(diagnostic.indexOf("data-dialog-initial-focus")).toBeLessThan(
      diagnostic.indexOf("Adresse e-mail"),
    );
  });

  it("keeps needs and business context before identity and contact fields", () => {
    expectInOrder(source("src/components/SolutionReferralForm.tsx"), [
      "Votre besoin",
      "Prénom et nom",
      "Adresse e-mail",
      "Cabinet ou entreprise",
    ]);
    expectInOrder(source("src/components/StructureProblemSubmissionForm.tsx"), [
      'htmlFor="structure-problem"',
      'htmlFor="structure-company-activity"',
      'htmlFor="structure-professional-page"',
      'htmlFor="structure-contact-email"',
    ]);
    expectInOrder(source("src/components/CoachBusinessCallbackForm.tsx"), [
      "Quelle est votre priorité ?",
      "Entreprise",
      "Numéro WhatsApp",
    ]);
    expectInOrder(source("src/components/AccountingAppointmentDialog.tsx"), [
      "Comment pouvons-nous vous aider ?",
      "Entreprise",
      'label="Email"',
      'label="Téléphone / WhatsApp"',
    ]);
  });

  it("keeps an event choice before the attendee contact details", () => {
    expectInOrder(source("src/components/AcademyLiveRegistrationModal.tsx"), [
      'htmlFor="academy-live-slot"',
      'htmlFor="academy-live-name"',
      'htmlFor="academy-live-email"',
      'htmlFor="academy-live-company"',
    ]);
  });

  it("preserves forms that were already need-first", () => {
    expectInOrder(source("src/components/OpportunitySubmissionDialog.tsx"), [
      "Titre",
      "Description",
      "Votre adresse e-mail",
    ]);
    expectInOrder(source("src/components/ProviderProfileModal.tsx"), [
      "Expertise principale",
      "Présentez brièvement votre expérience",
      "Site ou profil professionnel",
      "Prénom et nom",
      "Adresse e-mail",
      "Entreprise ou activité",
    ]);
    expectInOrder(source("src/components/ServiceCallbackForm.tsx"), [
      '"Entreprise"',
      '"Numéro WhatsApp"',
    ]);
  });

  it("asks for intent first, then keeps contact details in one stable order", () => {
    const publicForms = [
      source("src/components/AccountingRecommendationDialog.tsx"),
      source("src/components/AcademyLiveRegistrationModal.tsx"),
      source("src/components/BusinessEstimateControl.tsx"),
      source("src/components/AccompanimentContactControl.tsx"),
      source("src/components/GuestDiagnosticControl.tsx"),
      source("src/components/ProviderProfileModal.tsx"),
      source("src/components/RepriseMarketplaceClient.tsx"),
      source("src/components/SolutionReferralForm.tsx"),
    ];

    for (const form of publicForms) {
      expect(form).not.toContain('name="firstName"');
      expect(form).not.toContain('name="lastName"');
      expect(form).not.toContain("Nom et prénom");
    }

    expectInOrder(source("src/components/AccountingRecommendationDialog.tsx"), [
      "Votre besoin",
      'label="Prénom et nom"',
      'label="Email"',
      'label="Numéro de téléphone"',
    ]);
    expectInOrder(source("src/components/BusinessEstimateControl.tsx"), [
      "Votre entreprise en quelques mots",
      ">Prénom et nom<",
      ">Email<",
      ">Téléphone<",
      ">Entreprise<",
    ]);
    expectInOrder(source("src/components/AccompanimentContactControl.tsx"), [
      "Qu’aimeriez-vous améliorer, automatiser ou préparer ?",
      ">Prénom et nom<",
      ">Email<",
      ">Téléphone<",
      ">Entreprise<",
    ]);
    const estimate = source("src/components/BusinessEstimateControl.tsx");
    expect(estimate).not.toContain("(facultatif)");
    expect(estimate.match(/required/g)?.length).toBeGreaterThanOrEqual(5);
    expectInOrder(source("src/components/RepriseMarketplaceClient.tsx"), [
      "Votre projet en quelques mots",
      "Prénom et nom",
      "Email",
      "Téléphone",
      "Entreprise",
    ]);
    expectInOrder(source("src/components/GuestDiagnosticControl.tsx"), [
      "Qu’est-ce qui vous prend trop de temps aujourd’hui ?",
      "Prénom et nom",
      "Adresse e-mail",
      "Téléphone",
    ]);
  });
});
