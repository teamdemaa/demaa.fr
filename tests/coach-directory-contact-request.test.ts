import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceRateLimit: vi.fn(),
  enforceSameOrigin: vi.fn(),
  logOperationalError: vi.fn(),
  resolveLeadAttribution: vi.fn(),
  resolveLeadContext: vi.fn(),
  submitLeadRequest: vi.fn(),
}));

vi.mock("@/lib/api-security", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  normalizeIdempotencyKey: (value: unknown) => typeof value === "string" && value.length >= 8 ? value : null,
  normalizeText: (value: unknown, maxLength: number, options: { multiline?: boolean } = {}) => typeof value === "string" ? (options.multiline ? value.replace(/\r\n?/g, "\n").trim() : value.replace(/\s+/g, " ").trim()).slice(0, maxLength) : "",
  readJsonBody: async <T,>(request: Request) => ({ data: await request.json() as T, response: null }),
}));
vi.mock("@/lib/lead-attribution-server", () => ({ resolveLeadAttribution: mocks.resolveLeadAttribution }));
vi.mock("@/lib/lead-context", () => ({ resolveLeadContext: mocks.resolveLeadContext }));
vi.mock("@/lib/lead-notifications", () => ({ submitLeadRequest: mocks.submitLeadRequest }));
vi.mock("@/lib/operational-log", () => ({ logOperationalError: mocks.logOperationalError }));
vi.mock("@/lib/request-guard", () => ({ enforceSameOrigin: mocks.enforceSameOrigin }));

import { POST } from "@/app/api/coach-directory-contact-request/route";

function request(overrides: Record<string, unknown> = {}) {
  return new Request("https://demaa.fr/api/coach-directory-contact-request", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://demaa.fr", Referer: "https://demaa.fr/annuaire-coachs" },
    body: JSON.stringify({
      coachSlug: "igor-baschet",
      name: "Camille Martin",
      email: "camille@example.com",
      company: "Atelier Martin",
      phone: "+33 6 12 34 56 78",
      message: "Je cherche un accompagnement pour mieux piloter mon activité.",
      website: "",
      idempotencyKey: "coach:12345678",
      ...overrides,
    }),
  });
}

describe("coach directory contact request", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.resolveLeadAttribution.mockReturnValue({ conversion: {} });
    mocks.resolveLeadContext.mockResolvedValue({ source: "Annuaire coachs - Demande de contact", sourceUrl: "https://demaa.fr/annuaire-coachs" });
    mocks.submitLeadRequest.mockResolvedValue({ leadId: "lead-coach-1" });
  });

  it("sends an internal request tied to a real public coach, without claiming direct delivery", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      channels: { email: true, resend: false, slack: true },
      requestType: "coach_directory_contact",
      contact: { company: "Atelier Martin", email: "camille@example.com", name: "Camille Martin", phone: "+33 6 12 34 56 78" },
      fields: expect.arrayContaining([
        { label: "Coach demandé", value: "Igor Baschet" },
        { label: "Statut", value: "Profil public non vérifié ; mise en relation à confirmer" },
      ]),
    }));
  });

  it.each([
    { coachSlug: "unknown" },
    { email: "wrong" },
    { name: "" },
    { message: "" },
    { phone: "123" },
    { idempotencyKey: "bad" },
  ])("rejects invalid or incomplete requests %#", async (overrides) => {
    expect((await POST(request(overrides))).status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("blocks cross-origin submissions and ignores the honeypot", async () => {
    mocks.enforceSameOrigin.mockReturnValueOnce(new Response(null, { status: 403 }));
    expect((await POST(request())).status).toBe(403);
    expect(mocks.enforceRateLimit).not.toHaveBeenCalled();
    expect((await POST(request({ website: "robot" }))).status).toBe(200);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });
});
