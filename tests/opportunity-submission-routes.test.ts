import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  createPendingOpportunitySubmissionDraft: vi.fn(),
  enforceAllowedHost: vi.fn(),
  enforceRateLimit: vi.fn(),
  enforceSameOrigin: vi.fn(),
  requireCurrentCustomerEmail: vi.fn(),
  revalidateTag: vi.fn(),
  submitPendingOpportunityDraft: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidateTag: mocks.revalidateTag }));
vi.mock("@/lib/api-security", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  normalizeText: (value: unknown, maxLength: number) =>
    typeof value === "string" ? value.trim().slice(0, maxLength) : "",
  readJsonBody: async <T,>(request: Request) => ({
    data: await request.json() as T,
    response: null,
  }),
}));
vi.mock("@/lib/customer-space-session.server", () => ({
  requireCurrentCustomerEmail: mocks.requireCurrentCustomerEmail,
}));
vi.mock("@/lib/opportunity-submission.server", () => ({
  createPendingOpportunitySubmissionDraft:
    mocks.createPendingOpportunitySubmissionDraft,
  submitPendingOpportunityDraft: mocks.submitPendingOpportunityDraft,
}));
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: mocks.enforceAllowedHost,
  enforceSameOrigin: mocks.enforceSameOrigin,
}));

import { POST as createDraft } from "@/app/api/opportunity-submission-draft/route";
import { POST as submitDraft } from "@/app/api/opportunity-submissions/route";

function post(path: string, body: unknown) {
  return new Request(`https://demaa.co${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.co",
    },
    body: JSON.stringify(body),
  });
}

const completeDraft = {
  cadence: "3 mois",
  category: "Produit",
  expectations: "Cadrer le besoin\nTester la version",
  geography: "France",
  opportunityType: "mission",
  startTiming: "Septembre",
  summary: "Construire une première version testable avec un périmètre clairement défini.",
  title: "Construire une première version",
  workMode: "remote",
};

describe("opportunity submission routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.createPendingOpportunitySubmissionDraft.mockResolvedValue({
      draftToken: "a".repeat(43),
      expiresAt: "2026-08-14T12:00:00.000Z",
    });
    mocks.requireCurrentCustomerEmail.mockResolvedValue({
      email: "dirigeante@example.com",
      response: null,
    });
    mocks.submitPendingOpportunityDraft.mockResolvedValue({
      alreadySubmitted: false,
      opportunityId: "premiere-version-123abc",
    });
  });

  it("lets a guest prepare the complete draft before authentication", async () => {
    const response = await createDraft(post(
      "/api/opportunity-submission-draft",
      completeDraft,
    ));
    expect(response.status).toBe(201);
    expect(mocks.requireCurrentCustomerEmail).not.toHaveBeenCalled();
    expect(mocks.createPendingOpportunitySubmissionDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        cadence: "3 mois",
        expectations: ["Cadrer le besoin", "Tester la version"],
        startTiming: "Septembre",
      }),
    );
  });

  it("rejects an incomplete draft before writing", async () => {
    const response = await createDraft(post(
      "/api/opportunity-submission-draft",
      { title: "Incomplet" },
    ));
    expect(response.status).toBe(400);
    expect(mocks.createPendingOpportunitySubmissionDraft).not.toHaveBeenCalled();
  });

  it("binds the opaque draft to the verified session and invalidates admin data", async () => {
    const response = await submitDraft(post(
      "/api/opportunity-submissions",
      { draftToken: "a".repeat(43) },
    ));
    expect(response.status).toBe(201);
    expect(mocks.submitPendingOpportunityDraft).toHaveBeenCalledWith({
      draftToken: "a".repeat(43),
      email: "dirigeante@example.com",
    });
    expect(mocks.revalidateTag).toHaveBeenCalledWith(
      "provider-network-opportunities",
      { expire: 0 },
    );
  });

  it("requires the Demaa session only at final submission", async () => {
    mocks.requireCurrentCustomerEmail.mockResolvedValue({
      email: "",
      response: Response.json({ error: "Connexion requise." }, { status: 401 }),
    });
    const response = await submitDraft(post(
      "/api/opportunity-submissions",
      { draftToken: "a".repeat(43) },
    ));
    expect(response.status).toBe(401);
    expect(mocks.submitPendingOpportunityDraft).not.toHaveBeenCalled();
  });

  it("returns the existing result without duplicating a submitted draft", async () => {
    mocks.submitPendingOpportunityDraft.mockResolvedValue({
      alreadySubmitted: true,
      opportunityId: "premiere-version-123abc",
    });
    const response = await submitDraft(post(
      "/api/opportunity-submissions",
      { draftToken: "a".repeat(43) },
    ));
    expect(response.status).toBe(200);
  });
});
