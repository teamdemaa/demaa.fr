import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceAllowedHost: vi.fn(),
  enforceSameOrigin: vi.fn(),
  enforceServiceRequestRateLimit: vi.fn(),
  requireCurrentCustomerIdentity: vi.fn(),
  resolveLeadAttribution: vi.fn(),
  resolveLeadContext: vi.fn(),
  appendCustomerCoachingMessage: vi.fn(),
  claimPendingCoachingMessageDraft: vi.fn(),
  getCustomerCoachingState: vi.fn(),
  markCoachingMessageDraftSent: vi.fn(),
  submitLeadRequest: vi.fn(),
  resolveAuthenticatedInternationalContext: vi.fn(),
}));

vi.mock("@/lib/api-security", () => ({
  normalizeIdempotencyKey: (value: unknown) =>
    typeof value === "string" && value.length >= 8 ? value : null,
  normalizeText: (value: unknown, maxLength: number) =>
    typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "",
  readJsonBody: async <T,>(request: Request) => ({
    data: await request.json() as T,
    response: null,
  }),
}));
vi.mock("@/lib/customer-space-session.server", () => ({
  requireCurrentCustomerIdentity: mocks.requireCurrentCustomerIdentity,
}));
vi.mock("@/lib/coaching-conversation.server", () => ({
  appendCustomerCoachingMessage: mocks.appendCustomerCoachingMessage,
  getCustomerCoachingState: mocks.getCustomerCoachingState,
}));
vi.mock("@/lib/coaching-message-draft.server", () => ({
  claimPendingCoachingMessageDraft: mocks.claimPendingCoachingMessageDraft,
  markCoachingMessageDraftSent: mocks.markCoachingMessageDraftSent,
}));
vi.mock("@/lib/lead-attribution-server", () => ({
  resolveLeadAttribution: mocks.resolveLeadAttribution,
}));
vi.mock("@/lib/lead-context", () => ({ resolveLeadContext: mocks.resolveLeadContext }));
vi.mock("@/lib/lead-notifications", () => ({ submitLeadRequest: mocks.submitLeadRequest }));
vi.mock("@/lib/operational-log", () => ({ logOperationalError: vi.fn() }));
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: mocks.enforceAllowedHost,
  enforceSameOrigin: mocks.enforceSameOrigin,
}));
vi.mock("@/lib/service-request-security.server", () => ({
  enforceServiceRequestRateLimit: mocks.enforceServiceRequestRateLimit,
}));
vi.mock("@/lib/international-context.server", () => ({
  getConfiguredVisitorCommercialContext: () => ({ countryCode: null, currencyCode: "EUR", marketCode: "fr-fr" }),
  resolveAuthenticatedInternationalContext: mocks.resolveAuthenticatedInternationalContext,
}));

import { GET, POST } from "@/app/api/coaching-request/route";

function request(overrides: Record<string, unknown> = {}) {
  return new Request("https://demaa.co/api/coaching-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.co",
      Referer: "https://demaa.co/",
    },
    body: JSON.stringify({
      attribution: {},
      email: "spoofed@example.net",
      idempotencyKey: "coaching:12345678",
      message: "Je souhaite clarifier ma prochaine décision opérationnelle.",
      requestKind: "message",
      website: "",
      ...overrides,
    }),
  });
}

describe("coaching request route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceServiceRequestRateLimit.mockResolvedValue(null);
    mocks.requireCurrentCustomerIdentity.mockResolvedValue({
      identity: { email: "owner@example.com", provider: "password", uid: "owner-uid" },
      response: null,
    });
    mocks.resolveAuthenticatedInternationalContext.mockResolvedValue({
      companyContext: { companyId: "company-1" },
      internationalContext: { countryCode: null, currencyCode: "EUR", localeCode: "fr", marketCode: "fr-fr" },
    });
    mocks.resolveLeadAttribution.mockReturnValue({ conversion: {} });
    mocks.resolveLeadContext.mockResolvedValue({
      source: "Coaching - Messages",
      sourceUrl: "https://demaa.co/",
    });
    mocks.submitLeadRequest.mockResolvedValue({ duplicate: false, leadId: "lead-1" });
    mocks.appendCustomerCoachingMessage.mockResolvedValue({
      access: { canSend: true, freeStatus: "open" },
      allowed: true,
      created: true,
      message: {
        author: "customer",
        body: "Je souhaite clarifier ma prochaine décision opérationnelle.",
        createdAt: "2026-08-11T08:00:00.000Z",
        id: "message-1",
      },
    });
    mocks.getCustomerCoachingState.mockResolvedValue({
      access: { canSend: true, freeStatus: "available" },
      messages: [],
    });
    mocks.claimPendingCoachingMessageDraft.mockResolvedValue(null);
    mocks.markCoachingMessageDraftSent.mockResolvedValue(true);
  });

  it("uses the authenticated session email and ignores a body email", async () => {
    const response = await POST(request());

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      contact: expect.objectContaining({ email: "owner@example.com" }),
      requestType: "coaching_message",
    }));
    expect(mocks.appendCustomerCoachingMessage).toHaveBeenCalledWith({
      body: "Je souhaite clarifier ma prochaine décision opérationnelle.",
      email: "owner@example.com",
      idempotencyKey: "coaching:12345678",
      localeCode: "fr",
      marketCode: "fr-fr",
      countryCode: null,
      source: "echange",
      uid: "owner-uid",
    });
  });

  it("preserves the English locale and market in the shared conversation pipeline", async () => {
    mocks.resolveAuthenticatedInternationalContext.mockResolvedValue({
      companyContext: { companyId: "company-1" },
      internationalContext: { countryCode: "GB", currencyCode: "EUR", localeCode: "en", marketCode: "global-en-beta" },
    });
    const response = await POST(request({
      countryCode: "gb",
      localeCode: "en",
      marketCode: "global-en-beta",
      message: "I need to clarify my next operational decision.",
      source: "english-talk-to-us",
    }));

    expect(response.status).toBe(202);
    expect(mocks.appendCustomerCoachingMessage).toHaveBeenCalledWith({
      body: "I need to clarify my next operational decision.",
      countryCode: "GB",
      email: "owner@example.com",
      idempotencyKey: "coaching:12345678",
      localeCode: "en",
      marketCode: "global-en-beta",
      source: "english-talk-to-us",
      uid: "owner-uid",
    });
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: expect.arrayContaining([
        { label: "Langue", value: "en" },
        { label: "Marché", value: "global-en-beta" },
        { label: "Pays", value: "GB" },
        { label: "Source", value: "english-talk-to-us" },
      ]),
      title: "New free clarification",
    }));
  });

  it("returns the completed clarification state in English", async () => {
    mocks.resolveAuthenticatedInternationalContext.mockResolvedValue({
      companyContext: { companyId: "company-1" },
      internationalContext: {
        countryCode: null,
        currencyCode: "EUR",
        localeCode: "en",
        marketCode: "global-en-beta",
      },
    });
    mocks.appendCustomerCoachingMessage.mockResolvedValue({
      access: { canSend: false, freeStatus: "completed" },
      allowed: false,
    });

    const response = await POST(request({
      localeCode: "en",
      message: "I need to clarify my next operational decision.",
      source: "english-talk-to-us",
    }));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      code: "free_clarification_completed",
      error: "Your first clarification is complete.",
    });
  });

  it("ignores browser-controlled market and country values", async () => {
    const response = await POST(request({
      countryCode: "US",
      localeCode: "en",
      marketCode: "global-en-beta",
      source: "forged-source",
    }));

    expect(response.status).toBe(202);
    expect(mocks.resolveAuthenticatedInternationalContext).toHaveBeenCalledWith({
      identity: expect.objectContaining({ uid: "owner-uid" }),
      localeCode: "en",
    });
    expect(mocks.appendCustomerCoachingMessage).toHaveBeenCalledWith(expect.objectContaining({
      countryCode: null,
      marketCode: "fr-fr",
      source: "english-talk-to-us",
    }));
  });

  it("rejects an unsupported request locale instead of falling back to French", async () => {
    const response = await POST(request({ localeCode: "de" }));

    expect(response.status).toBe(400);
    expect(mocks.resolveAuthenticatedInternationalContext).not.toHaveBeenCalled();
    expect(mocks.appendCustomerCoachingMessage).not.toHaveBeenCalled();
  });

  it("refuses a coaching request without an authenticated session", async () => {
    mocks.requireCurrentCustomerIdentity.mockResolvedValue({
      identity: null,
      response: Response.json({ error: "authentication_required" }, { status: 401 }),
    });

    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("blocks a new message after the free clarification is completed", async () => {
    mocks.appendCustomerCoachingMessage.mockResolvedValue({
      access: { canSend: false, freeStatus: "completed" },
      allowed: false,
    });

    const response = await POST(request());

    expect(response.status).toBe(409);
    expect(mocks.appendCustomerCoachingMessage).toHaveBeenCalledOnce();
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      code: "free_clarification_completed",
      draftMessage: "Je souhaite clarifier ma prochaine décision opérationnelle.",
    });
  });

  it("claims a server draft and ignores client-controlled message and idempotency", async () => {
    mocks.claimPendingCoachingMessageDraft.mockResolvedValue({
      alreadySent: false,
      body: "Message conservé avant la connexion.",
      idempotencyKey: "coaching:draft:server-owned-key",
    });

    const response = await POST(request({
      draftToken: "a".repeat(43),
      idempotencyKey: "coaching:forged-client-key",
      message: "Message forgé côté client.",
    }));

    expect(response.status).toBe(202);
    expect(mocks.claimPendingCoachingMessageDraft).toHaveBeenCalledWith({
      draftToken: "a".repeat(43),
      uid: "owner-uid",
    });
    expect(mocks.appendCustomerCoachingMessage).toHaveBeenCalledWith({
      body: "Message conservé avant la connexion.",
      email: "owner@example.com",
      idempotencyKey: "coaching:draft:server-owned-key",
      localeCode: "fr",
      marketCode: "fr-fr",
      countryCode: null,
      source: "echange",
      uid: "owner-uid",
    });
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: expect.arrayContaining([
        { label: "Message", value: "Message conservé avant la connexion." },
        { label: "Langue", value: "fr" },
        { label: "Marché", value: "fr-fr" },
        { label: "Source", value: "echange" },
      ]),
      idempotencyKey: "coaching:draft:server-owned-key",
    }));
    expect(mocks.markCoachingMessageDraftSent).toHaveBeenCalledWith({
      draftToken: "a".repeat(43),
      uid: "owner-uid",
    });
  });

  it("rejects an unavailable draft without accepting the client fallback", async () => {
    const response = await POST(request({
      draftToken: "a".repeat(43),
      message: "Ce texte ne doit pas contourner le claim.",
    }));

    expect(response.status).toBe(409);
    expect(mocks.appendCustomerCoachingMessage).not.toHaveBeenCalled();
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("accepts a sent-draft retry with the same server idempotency key", async () => {
    mocks.claimPendingCoachingMessageDraft.mockResolvedValue({
      alreadySent: true,
      body: "Message déjà accepté lors du premier essai.",
      idempotencyKey: "coaching:draft:stable-retry-key",
    });
    mocks.appendCustomerCoachingMessage.mockResolvedValue({
      access: { canSend: true, freeStatus: "open" },
      allowed: true,
      created: false,
      message: {
        author: "customer",
        body: "Message déjà accepté lors du premier essai.",
        createdAt: "2026-08-11T08:00:00.000Z",
        id: "existing-message",
      },
    });
    mocks.submitLeadRequest.mockResolvedValue({
      duplicate: true,
      leadId: "existing-lead",
    });

    const response = await POST(request({ draftToken: "a".repeat(43) }));

    expect(response.status).toBe(202);
    expect(mocks.appendCustomerCoachingMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: "coaching:draft:stable-retry-key",
      }),
    );
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: "coaching:draft:stable-retry-key",
      }),
    );
    expect(mocks.markCoachingMessageDraftSent).toHaveBeenCalledOnce();
  });

  it("returns the claimed text when delivery fails so the composer can retry", async () => {
    mocks.claimPendingCoachingMessageDraft.mockResolvedValue({
      alreadySent: false,
      body: "Message à conserver après l’échec.",
      idempotencyKey: "coaching:draft:retry-key",
    });
    mocks.submitLeadRequest.mockRejectedValueOnce(new Error("delivery_failed"));

    const response = await POST(request({ draftToken: "a".repeat(43) }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      draftMessage: "Message à conserver après l’échec.",
    });
    expect(mocks.markCoachingMessageDraftSent).not.toHaveBeenCalled();
  });

  it("accepts only the current monthly accompaniment and records its displayed price", async () => {
    const response = await POST(request({
      company: "Entreprise test",
      message: "",
      offer: "coach_business",
      phone: "+33 6 12 34 56 78",
      requestKind: "accompaniment",
    }));

    expect(response.status).toBe(202);
    expect(mocks.requireCurrentCustomerIdentity).not.toHaveBeenCalled();
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: expect.arrayContaining([
        { label: "Accompagnement", value: "Coach business · accompagnement mensuel" },
        { label: "Tarif affiché", value: "750 € HT / mois" },
      ]),
      requestType: "coach_business_callback",
    }));
  });

  it("rejects the retired one-off coaching offers", async () => {
    const response = await POST(request({
      company: "Entreprise test",
      message: "",
      offer: "session",
      phone: "+33 6 12 34 56 78",
      requestKind: "accompaniment",
    }));

    expect(response.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("rejects inherited object keys as formula identifiers", async () => {
    const response = await POST(request({
      company: "Entreprise test",
      message: "",
      offer: "toString",
      phone: "+33 6 12 34 56 78",
      requestKind: "accompaniment",
    }));

    expect(response.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("returns only the authenticated customer's conversation without caching", async () => {
    mocks.getCustomerCoachingState.mockResolvedValue({
      access: { canSend: false, freeStatus: "completed" },
      messages: [{
        author: "specialist",
        body: "Voici la prochaine étape.",
        createdAt: "2026-08-11T09:00:00.000Z",
        id: "reply-1",
      }],
    });

    const response = await GET(request());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.getCustomerCoachingState).toHaveBeenCalledWith("owner-uid");
    expect(payload.messages).toHaveLength(1);
    expect(payload.access).toEqual({ canSend: false, freeStatus: "completed" });
  });
});
