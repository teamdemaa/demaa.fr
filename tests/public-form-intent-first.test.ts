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
      "Comment pouvons-nous vous aider ?",
      "Adresse e-mail",
      "Téléphone",
    ]);
    expect(diagnostic.indexOf("data-dialog-initial-focus")).toBeGreaterThan(
      diagnostic.indexOf("Comment pouvons-nous vous aider ?"),
    );
    expect(diagnostic.indexOf("data-dialog-initial-focus")).toBeLessThan(
      diagnostic.indexOf("Adresse e-mail"),
    );
  });

  it("keeps needs and business context before identity and contact fields", () => {
    expectInOrder(source("src/components/SolutionReferralForm.tsx"), [
      "Votre besoin",
      "Cabinet ou entreprise",
      "Prénom",
      "Adresse e-mail",
    ]);
    expectInOrder(source("src/components/StructureNewsletterBlock.tsx"), [
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
      "Créneau",
      "Entreprise",
      "Nom et prénom",
      "E-mail professionnel",
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
      "Nom et prénom",
      "Adresse e-mail",
    ]);
    expectInOrder(source("src/components/ServiceCallbackForm.tsx"), [
      '"Entreprise"',
      '"Numéro WhatsApp"',
    ]);
  });
});
