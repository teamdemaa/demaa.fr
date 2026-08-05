import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildServiceRequestSnapshot,
  buildSolutionReferralSnapshot,
} from "@/lib/service-request-snapshots.server";

const service = {
  categoryId: "structurer-digitaliser" as const,
  categoryTitle: "Structurer et digitaliser votre activité" as const,
  description: "Créer un site clair.",
  offerVersion: "1.0.0",
  operatorType: "demaa" as const,
  pricing: { amountMinor: 95000, currency: "EUR" as const, mode: "fixed" as const, taxMode: "excluding_tax" as const },
  scope: { clientResponsibilities: ["Fournir les textes"], deliverables: ["Cinq pages"], exclusions: ["Hébergement"], prerequisites: ["Nom de domaine"] },
  slug: "site-vitrine-prise-contact" as const,
  title: "Site vitrine & prise de contact",
};
const resource = {
  commercialRelationship: "paid_referral" as const,
  description: "Sous-traitance juridique.",
  interaction: { interactionMode: "referral_form" as const, referralKey: "legal-referral" },
  name: "Partenaire Juridique",
  resourceSlug: "partenaire-juridique",
  resourceType: "provider" as const,
  resourceVersion: "1.0.0",
};
const placement = {
  fitConstraints: ["Cabinets comptables"],
  fitRationale: "Renfort externe qualifié.",
  placementId: "cabinet-comptable:partenaire-juridique:providers:1",
  placementVersion: "1.0.0",
  rank: 1,
  resource,
  section: "providers" as const,
  systemSlug: "cabinet-comptable",
  usage: "Délégation juridique",
};
const disclosure = {
  billingParty: "Juridique Services SAS",
  commercialRelationship: "paid_referral" as const,
  contractingParty: "Juridique Services SAS",
  disclosureVersion: "1.0.0",
  effectiveAt: "2026-07-01T00:00:00.000Z",
  expiresAt: "2027-07-01T00:00:00.000Z",
  placementId: placement.placementId,
  resourceSlug: resource.resourceSlug,
  reviewedAt: "2026-06-25T00:00:00.000Z",
  reviewer: "legal@demaa.fr",
  transparency: "Le partenaire contracte et facture. Demaa peut être rémunérée.",
};

describe("immutable request snapshots", () => {
  it("captures the complete Service offer and changes hash with scope", () => {
    const first = buildServiceRequestSnapshot(service);
    const changed = buildServiceRequestSnapshot({
      ...service,
      scope: { ...service.scope, deliverables: ["Six pages"] },
    });
    expect(first).toMatchObject({
      category_id: service.categoryId,
      description: service.description,
      offer_version: service.offerVersion,
      operator_type: service.operatorType,
      pricing: service.pricing,
      scope: service.scope,
    });
    expect(first.content_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(changed.content_hash).not.toBe(first.content_hash);
  });

  it("captures resource, placement, fit, interaction and reviewed disclosure", () => {
    const snapshot = buildSolutionReferralSnapshot({ disclosure, placement, resource });
    expect(snapshot).toMatchObject({
      commercial_relationship: "paid_referral",
      disclosure_version: "1.0.0",
      effective_at: disclosure.effectiveAt,
      expires_at: disclosure.expiresAt,
      fit_constraints: placement.fitConstraints,
      fit_rationale: placement.fitRationale,
      interaction: resource.interaction,
      placement_id: placement.placementId,
      reviewed_at: disclosure.reviewedAt,
      reviewer: disclosure.reviewer,
      usage: placement.usage,
    });
    expect(snapshot.content_hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
