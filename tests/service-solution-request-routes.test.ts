import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  createSolutionReferral: vi.fn(),
  enforceSecurity: vi.fn(),
  getEnterpriseBySlug: vi.fn(),
  getSolution: vi.fn(),
  getSolutionDisclosure: vi.fn(),
  getExpertiseReferralContext: vi.fn(),
  getExpertiseReferralDisclosure: vi.fn(),
  getSolutionPlacements: vi.fn(),
  logOperationalError: vi.fn(),
  logOperationalEvent: vi.fn(),
  RequestIdempotencyConflictError: class extends Error {},
  resolveLeadAttribution: vi.fn(),
  scheduleServiceSolutionDeliveries: vi.fn(),
}));

vi.mock("@/lib/enterprise-annuaire-server", () => ({
  getEnterpriseBySlug: mocks.getEnterpriseBySlug,
}));
vi.mock("@/lib/lead-attribution-server", () => ({
  resolveLeadAttribution: mocks.resolveLeadAttribution,
}));
vi.mock("@/lib/operational-log", () => ({
  logOperationalError: mocks.logOperationalError,
  logOperationalEvent: mocks.logOperationalEvent,
}));
vi.mock("@/lib/service-request-security.server", () => ({
  enforceServiceRequestRateLimit: mocks.enforceSecurity,
}));
vi.mock("@/lib/service-request-delivery-scheduler.server", () => ({
  scheduleServiceSolutionDeliveries: mocks.scheduleServiceSolutionDeliveries,
}));
vi.mock("@/lib/service-request-storage.server", () => ({
  createSolutionReferral: mocks.createSolutionReferral,
  RequestIdempotencyConflictError: mocks.RequestIdempotencyConflictError,
}));
vi.mock("@/lib/solution-registry.server", () => ({
  getPublishedSolutionPlacementsForSystem: mocks.getSolutionPlacements,
  getPublishedSolutionResourceBySlug: mocks.getSolution,
}));
vi.mock("@/lib/solution-referral-disclosures.server", () => ({
  getSolutionReferralDisclosure: mocks.getSolutionDisclosure,
  getExpertiseReferralDisclosure: mocks.getExpertiseReferralDisclosure,
}));
vi.mock("@/lib/expertise-solutions.server", () => ({
  getExpertiseReferralContext: mocks.getExpertiseReferralContext,
}));

import { POST as submitSolution } from "@/app/api/solution-referral/route";
const publishedResource = {
  commercialRelationship: "paid_referral" as const,
  description: "Sous-traitance juridique.",
  interaction: { interactionMode: "referral_form" as const, referralKey: "legal-referral" },
  name: "Partenaire Juridique",
  resourceSlug: "partenaire-juridique",
  resourceType: "provider" as const,
  resourceVersion: "1.0.0",
};
const publishedPlacement = {
  fitConstraints: [],
  fitRationale: "Renfort externe qualifié.",
  placementId: "cabinet-comptable:partenaire-juridique:providers:1",
  placementVersion: "1.0.0",
  rank: 1,
  resource: publishedResource,
  section: "providers" as const,
  systemSlug: "cabinet-comptable",
  usage: "Délégation juridique",
};

function request(path: string, body: Record<string, unknown>, origin = "https://demaa.fr") {
  return new Request(`https://demaa.fr${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });
}

function solutionBody(overrides: Record<string, unknown> = {}) {
  return {
    attribution: { version: 1 },
    company: "Cabinet Martin",
    email: "maya@cabinet-martin.fr",
    firstName: "Maya",
    idempotencyKey: "web:solution:12345678",
    marketingConsent: false,
    need: "Déléguer une partie du juridique.",
    resourceSlug: "partenaire-juridique",
    systemSlug: "cabinet-comptable",
    ...overrides,
  };
}

describe("solution referral request route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SITE_URL = "https://demaa.fr";
    mocks.enforceSecurity.mockResolvedValue(null);
    mocks.getEnterpriseBySlug.mockResolvedValue({ slug: "batiment" });
    mocks.getSolution.mockReturnValue(null);
    mocks.getSolutionDisclosure.mockReturnValue(null);
    mocks.getExpertiseReferralContext.mockResolvedValue(null);
    mocks.getExpertiseReferralDisclosure.mockReturnValue(null);
    mocks.getSolutionPlacements.mockReturnValue([]);
    mocks.resolveLeadAttribution.mockReturnValue({ conversion: {} });
    mocks.createSolutionReferral.mockImplementation(async (input) => ({
      created: true,
      id: "solution-referral-id",
      record: {
        solution: input.solution,
        system_slug: input.systemSlug,
      },
    }));
  });

  it("rejects cross-origin requests before parsing or storage", async () => {
    const response = await submitSolution(request(
      "/api/solution-referral",
      solutionBody(),
      "https://evil.example",
    ));
    expect(response.status).toBe(403);
    expect(mocks.enforceSecurity).not.toHaveBeenCalled();
    expect(mocks.createSolutionReferral).not.toHaveBeenCalled();
  });

  it("enforces rate limiting before mutation", async () => {
    mocks.enforceSecurity.mockResolvedValueOnce(
      Response.json({ error: "rate" }, { status: 429 }),
    );
    const response = await submitSolution(request("/api/solution-referral", solutionBody()));
    expect(response.status).toBe(429);
    expect(mocks.createSolutionReferral).not.toHaveBeenCalled();
  });

  it("refuses an unavailable solution referral by default", async () => {
    const response = await submitSolution(request("/api/solution-referral", solutionBody()));
    expect(response.status).toBe(404);
    expect(mocks.createSolutionReferral).not.toHaveBeenCalled();
    expect(mocks.enforceSecurity).toHaveBeenCalledTimes(1);
  });

  it("stores external contracting, billing and transparency server-side", async () => {
    mocks.getSolution.mockReturnValue(publishedResource);
    mocks.getSolutionPlacements.mockReturnValue([publishedPlacement]);
    mocks.getSolutionDisclosure.mockReturnValue({
      billingParty: "Juridique Services SAS",
      commercialRelationship: "paid_referral",
      contractingParty: "Juridique Services SAS",
      disclosureVersion: "1.0.0",
      effectiveAt: "2026-07-01T00:00:00.000Z",
      expiresAt: "2027-07-01T00:00:00.000Z",
      placementId: publishedPlacement.placementId,
      resourceSlug: publishedResource.resourceSlug,
      reviewedAt: "2026-06-25T00:00:00.000Z",
      reviewer: "legal@demaa.fr",
      transparency: "Juridique Services SAS contracte et facture. Demaa peut recevoir une rémunération.",
    });
    const response = await submitSolution(request("/api/solution-referral", solutionBody()));

    expect(response.status).toBe(202);
    expect(mocks.createSolutionReferral).toHaveBeenCalledWith(expect.objectContaining({
      marketingConsent: null,
      solution: expect.objectContaining({
        billing_party: "Juridique Services SAS",
        commercial_relationship: "paid_referral",
        contracting_party: "Juridique Services SAS",
        placement_id: publishedPlacement.placementId,
        resource_name: publishedResource.name,
        resource_slug: publishedResource.resourceSlug,
        transparency: expect.stringContaining("rémunération"),
      }),
    }));
    expect(mocks.scheduleServiceSolutionDeliveries).toHaveBeenCalledOnce();
  });

  it("stores a canonical expertise request without inventing a partner relationship", async () => {
    const expertiseResource = {
      ...publishedResource,
      commercialRelationship: "none" as const,
      name: "Expert-comptable",
      resourceSlug: "chartered-accountant",
      resourceType: "expertise" as const,
    };
    const expertisePlacement = {
      ...publishedPlacement,
      placementId: "cabinet-davocat:chartered-accountant:services:1",
      resource: expertiseResource,
      section: "services" as const,
      systemSlug: "cabinet-davocat",
    };
    mocks.getEnterpriseBySlug.mockResolvedValue({ slug: "cabinet-davocat" });
    mocks.getExpertiseReferralContext.mockResolvedValue({
      placement: expertisePlacement,
      resource: expertiseResource,
    });
    mocks.getExpertiseReferralDisclosure.mockReturnValue({
      billingParty: "Le professionnel retenu après qualification",
      commercialRelationship: "none",
      contractingParty: "Le professionnel retenu après qualification",
      disclosureVersion: "1.0.0",
      effectiveAt: "2026-08-08T00:00:00.000Z",
      expiresAt: "2027-08-08T00:00:00.000Z",
      placementId: expertisePlacement.placementId,
      resourceSlug: expertiseResource.resourceSlug,
      reviewedAt: "2026-08-08T00:00:00.000Z",
      reviewer: "Master Demaa",
      transparency: "Demaa qualifie le besoin sans imposer de professionnel.",
    });

    const response = await submitSolution(request("/api/solution-referral", solutionBody({
      resourceSlug: "chartered-accountant",
      systemSlug: "cabinet-davocat",
    })));

    expect(response.status).toBe(202);
    expect(mocks.createSolutionReferral).toHaveBeenCalledWith(expect.objectContaining({
      solution: expect.objectContaining({
        commercial_relationship: "none",
        resource_name: "Expert-comptable",
        resource_slug: "chartered-accountant",
        section: "services",
        transparency: expect.not.stringMatching(/partenaire|affilié/i),
      }),
    }));
    expect(mocks.scheduleServiceSolutionDeliveries).toHaveBeenCalledOnce();
  });

  it("never routes an owned solution through the external referral workflow", async () => {
    mocks.getSolution.mockReturnValue({
      ...publishedResource,
      commercialRelationship: "owned",
    });
    mocks.getSolutionPlacements.mockReturnValue([{
      ...publishedPlacement,
      resource: { ...publishedResource, commercialRelationship: "owned" },
    }]);
    mocks.getSolutionDisclosure.mockReturnValue({
      billingParty: "Demaa",
      commercialRelationship: "paid_referral",
      contractingParty: "Demaa",
      disclosureVersion: "1.0.0",
      effectiveAt: "2026-07-01T00:00:00.000Z",
      expiresAt: "2027-07-01T00:00:00.000Z",
      placementId: publishedPlacement.placementId,
      resourceSlug: publishedResource.resourceSlug,
      reviewedAt: "2026-06-25T00:00:00.000Z",
      reviewer: "legal@demaa.fr",
      transparency: "Demaa contracte et facture.",
    });

    const response = await submitSolution(request("/api/solution-referral", solutionBody()));
    expect(response.status).toBe(404);
    expect(mocks.createSolutionReferral).not.toHaveBeenCalled();
  });

  it("returns 409 when an idempotency key is reused with another fingerprint", async () => {
    mocks.getSolution.mockReturnValue(publishedResource);
    mocks.getSolutionPlacements.mockReturnValue([publishedPlacement]);
    mocks.getSolutionDisclosure.mockReturnValue({
      billingParty: "Juridique Services SAS",
      commercialRelationship: "paid_referral",
      contractingParty: "Juridique Services SAS",
      disclosureVersion: "1.0.0",
      effectiveAt: "2026-07-01T00:00:00.000Z",
      expiresAt: "2027-07-01T00:00:00.000Z",
      placementId: publishedPlacement.placementId,
      resourceSlug: publishedResource.resourceSlug,
      reviewedAt: "2026-06-25T00:00:00.000Z",
      reviewer: "legal@demaa.fr",
      transparency: "Juridique Services SAS contracte et facture.",
    });
    mocks.createSolutionReferral.mockRejectedValue(new mocks.RequestIdempotencyConflictError());
    const response = await submitSolution(request("/api/solution-referral", solutionBody()));
    expect(response.status).toBe(409);
    expect(mocks.logOperationalError).not.toHaveBeenCalled();
  });
});
