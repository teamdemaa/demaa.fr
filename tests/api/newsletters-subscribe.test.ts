import { beforeEach, describe, expect, it, vi } from "vitest";

const enforceRateLimit = vi.fn();
const getNewsletterBySlug = vi.fn();
const saveNewsletterSubscriber = vi.fn();
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

vi.mock("@/lib/newsletter-content", () => ({
  getNewsletterBySlug,
}));

vi.mock("@/lib/generations-db", () => ({
  saveNewsletterSubscriber,
}));

vi.mock("@/lib/slack", () => ({
  sendSlackMessage,
  SlackMessageError: MockSlackMessageError,
}));

describe("POST /api/newsletters/subscribe", () => {
  beforeEach(() => {
    vi.resetModules();
    enforceRateLimit.mockResolvedValue(null);
    getNewsletterBySlug.mockResolvedValue?.(undefined);
    getNewsletterBySlug.mockReturnValue({
      title: "Newsletter Cabinet Comptable",
      sectorLabel: "Cabinet comptable",
    });
    saveNewsletterSubscriber.mockResolvedValue(undefined);
    sendSlackMessage.mockResolvedValue(undefined);
  });

  it("rejects invalid payloads", async () => {
    const { POST } = await import("@/app/api/newsletters/subscribe/route");
    const response = await POST(
      new Request("https://demaa.fr/api/newsletters/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firstName: "", email: "bad", newsletterSlug: "" }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Merci de renseigner votre prénom, votre email et une newsletter valide.",
    });
  });

  it("returns the Slack error status when Slack rejects the request", async () => {
    sendSlackMessage.mockRejectedValue(new MockSlackMessageError("slack", 503));
    const { POST } = await import("@/app/api/newsletters/subscribe/route");
    const response = await POST(
      new Request("https://demaa.fr/api/newsletters/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName: "Jean",
          email: "jean@demaa.fr",
          newsletterSlug: "cabinet-comptable",
        }),
      })
    );

    expect(response.status).toBe(503);
  });

  it("persists and notifies valid subscriptions", async () => {
    const { POST } = await import("@/app/api/newsletters/subscribe/route");
    const response = await POST(
      new Request("https://demaa.fr/api/newsletters/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName: "Jean",
          email: "jean@demaa.fr",
          newsletterSlug: "cabinet-comptable",
        }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(saveNewsletterSubscriber).toHaveBeenCalledWith({
      firstName: "Jean",
      email: "jean@demaa.fr",
      newsletterSlug: "cabinet-comptable",
    });
    expect(sendSlackMessage).toHaveBeenCalled();
  });
});
