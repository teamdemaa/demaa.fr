import { beforeEach, describe, expect, it, vi } from "vitest";

const enforceRateLimit = vi.fn();
const savePartnerOffersSubscriber = vi.fn();
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

vi.mock("@/lib/generations-db", () => ({
  savePartnerOffersSubscriber,
}));

vi.mock("@/lib/slack", () => ({
  sendSlackMessage,
  SlackMessageError: MockSlackMessageError,
}));

describe("POST /api/offres-partenaires", () => {
  beforeEach(() => {
    vi.resetModules();
    enforceRateLimit.mockResolvedValue(null);
    savePartnerOffersSubscriber.mockResolvedValue(undefined);
    sendSlackMessage.mockResolvedValue(undefined);
  });

  it("rejects incomplete payloads", async () => {
    const { POST } = await import("@/app/api/offres-partenaires/route");
    const response = await POST(
      new Request("https://demaa.fr/api/offres-partenaires", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firstName: "", sector: "", email: "" }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Merci de renseigner votre prénom, votre secteur et votre email.",
    });
  });

  it("persists valid submissions", async () => {
    const { POST } = await import("@/app/api/offres-partenaires/route");
    const response = await POST(
      new Request("https://demaa.fr/api/offres-partenaires", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName: "Jean",
          sector: "BTP",
          email: "jean@demaa.fr",
          source: "landing",
        }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(savePartnerOffersSubscriber).toHaveBeenCalledWith({
      firstName: "Jean",
      sector: "BTP",
      email: "jean@demaa.fr",
      source: "landing",
    });
  });
});
