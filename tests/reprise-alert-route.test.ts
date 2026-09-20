import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  createRepriseAlert: vi.fn(),
  deliverCreationNotifications: vi.fn(),
  enforceAllowedHost: vi.fn(),
  enforceRateLimit: vi.fn(),
  enforceSameOrigin: vi.fn(),
  logOperationalError: vi.fn(),
  logOperationalEvent: vi.fn(),
}));

vi.mock("@/lib/api-security", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  normalizeIdempotencyKey: (value: unknown) => typeof value === "string" && value.length >= 8 ? value : null,
  normalizeText: (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "",
  readJsonBody: async <T,>(request: Request) => ({ data: await request.json() as T, response: null }),
}));
vi.mock("@/lib/request-guard", () => ({ enforceAllowedHost: mocks.enforceAllowedHost, enforceSameOrigin: mocks.enforceSameOrigin }));
vi.mock("@/lib/operational-log", () => ({ logOperationalError: mocks.logOperationalError, logOperationalEvent: mocks.logOperationalEvent }));
vi.mock("@/lib/reprise-alert-storage.server", () => ({ createRepriseAlert: mocks.createRepriseAlert }));
vi.mock("@/lib/reprise-alert-delivery-worker.server", () => ({ deliverRepriseAlertCreationNotifications: mocks.deliverCreationNotifications }));

import { POST } from "@/app/api/reprise-alerts/route";

function request(email = "alex@example.com") {
  return new Request("https://demaa.fr/api/reprise-alerts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://demaa.fr" },
    body: JSON.stringify({
      criteria: { budgetMax: 300_000, categories: ["Services terrain"], includeMissing: true, query: "rénovation", regions: ["Provence-Alpes-Côte d’Azur"], revenueMin: null },
      email,
      idempotencyKey: "reprise-alert:12345678",
      website: "",
    }),
  });
}

describe("POST /api/reprise-alerts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.createRepriseAlert.mockResolvedValue({ accessToken: "token", created: true, id: "alert-1" });
    mocks.deliverCreationNotifications.mockResolvedValue([
      { alertId: "alert-1", channel: "subscriber_confirmation", status: "sent" },
      { alertId: "alert-1", channel: "internal_notification", status: "sent" },
    ]);
  });

  it("creates an email-only alert and sends both notifications", async () => {
    const response = await POST(request());
    expect(response.status).toBe(202);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.matchIds).toContain("sols-murs-alpes-maritimes");
    expect(mocks.createRepriseAlert).toHaveBeenCalledWith(expect.objectContaining({ email: "alex@example.com" }));
    expect(mocks.deliverCreationNotifications).toHaveBeenCalledWith(expect.objectContaining({
      accessToken: "token",
      alertId: "alert-1",
      brand: "demaa",
      email: "alex@example.com",
    }));
    expect(JSON.stringify(mocks.createRepriseAlert.mock.calls)).not.toContain("phone");
    expect(JSON.stringify(mocks.createRepriseAlert.mock.calls)).not.toContain("company");
  });

  it("records SINI provenance and returns alert links on gosini.fr", async () => {
    const siniRequest = new Request("https://demaa.fr/api/reprise-alerts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://demaa.fr",
        "x-sini-form": "1",
        "x-sini-site-origin": "https://gosini.fr",
      },
      body: JSON.stringify({
        criteria: { budgetMax: null, categories: [], includeMissing: true, query: "", regions: [], revenueMin: null },
        email: "alex@example.com",
        idempotencyKey: "reprise-alert:87654321",
      }),
    });

    expect((await POST(siniRequest)).status).toBe(202);
    expect(mocks.createRepriseAlert).toHaveBeenCalledWith(expect.objectContaining({ brand: "sini" }));
    expect(mocks.deliverCreationNotifications).toHaveBeenCalledWith(expect.objectContaining({
      baseUrl: "https://gosini.fr",
      brand: "sini",
    }));
  });

  it("rejects an invalid email", async () => {
    expect((await POST(request("invalid"))).status).toBe(400);
    expect(mocks.createRepriseAlert).not.toHaveBeenCalled();
  });
});
