import { beforeEach, describe, expect, it, vi } from "vitest";

const enforceRateLimit = vi.fn();
const getAccountingFirmBySlug = vi.fn();
const getAccountingFirms = vi.fn();
const sendSlackMessage = vi.fn();

class MockSlackMessageError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

vi.mock("@/lib/api-security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-security")>("@/lib/api-security");
  return { ...actual, enforceRateLimit };
});

vi.mock("@/lib/accounting-directory", () => ({
  getAccountingFirmBySlug,
  getAccountingFirms,
}));

vi.mock("@/lib/slack", () => ({
  sendSlackMessage,
  SlackMessageError: MockSlackMessageError,
}));

describe("POST /api/accounting-directory-appointment-request", () => {
  beforeEach(() => {
    vi.resetModules();
    enforceRateLimit.mockResolvedValue(null);
    getAccountingFirmBySlug.mockResolvedValue({
      slug: "cabinet-a",
      name: "Cabinet A",
      city: "Paris",
    });
    getAccountingFirms.mockResolvedValue([
      { slug: "cabinet-a", name: "Cabinet A", city: "Paris" },
      { slug: "cabinet-b", name: "Cabinet B", city: "Lyon" },
    ]);
    sendSlackMessage.mockResolvedValue(undefined);
  });

  it("accepts honeypot submissions without processing them", async () => {
    const { POST } = await import("@/app/api/accounting-directory-appointment-request/route");
    const response = await POST(
      new Request("https://demaa.fr/api/accounting-directory-appointment-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ website: "bot-field" }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(sendSlackMessage).not.toHaveBeenCalled();
  });

  it("rejects incomplete requests", async () => {
    const { POST } = await import("@/app/api/accounting-directory-appointment-request/route");
    const response = await POST(
      new Request("https://demaa.fr/api/accounting-directory-appointment-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firmSlug: "",
          email: "",
          phone: "",
          company: { name: "" },
        }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error:
        "Merci de remplir les informations principales pour demander une mise en relation.",
    });
  });

  it("returns 404 when firms cannot be resolved", async () => {
    getAccountingFirmBySlug.mockResolvedValue(null);
    const { POST } = await import("@/app/api/accounting-directory-appointment-request/route");
    const response = await POST(
      new Request("https://demaa.fr/api/accounting-directory-appointment-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firmSlug: "cabinet-introuvable",
          email: "jean@demaa.fr",
          phone: "+33600000000",
          company: { name: "Demaa" },
        }),
      })
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Cabinet introuvable.",
    });
  });

  it("sends valid appointment requests to Slack", async () => {
    const { POST } = await import("@/app/api/accounting-directory-appointment-request/route");
    const response = await POST(
      new Request("https://demaa.fr/api/accounting-directory-appointment-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firmSlug: "cabinet-a",
          email: "jean@demaa.fr",
          phone: "+33600000000",
          message: "Besoin d'un cabinet",
          company: {
            name: "Demaa",
            activity: "Conseil",
            city: "Paris",
          },
        }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(sendSlackMessage).toHaveBeenCalled();
  });
});
