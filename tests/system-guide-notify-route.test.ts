import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  rateLimits: [] as Array<{ keyPrefix: string; suffix?: string }>,
  submitted: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/lib/api-security", () => ({
  enforceRateLimit: async (
    _request: Request,
    options: { keyPrefix: string },
    suffix?: string,
  ) => {
    mocks.rateLimits.push({ keyPrefix: options.keyPrefix, suffix });
    return null;
  },
  normalizeText: (value: unknown, max: number) =>
    typeof value === "string"
      ? value.replace(/\s+/g, " ").trim().slice(0, max)
      : "",
  readJsonBody: async (request: Request) => ({
    data: await request.json(),
    response: null,
  }),
}));
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: () => null,
  enforceSameOrigin: () => null,
}));
vi.mock("@/lib/enterprise-annuaire-server", () => ({
  getEnterpriseBySlug: async (slug: string) =>
    slug === "restaurant" ? { slug, name: "Restaurant" } : null,
}));
vi.mock("@/lib/enterprise-annuaire", () => ({
  enterpriseToSystem: () => ({ name: "Restaurant" }),
}));
vi.mock("@/lib/lead-attribution-server", () => ({
  resolveLeadAttribution: () => ({ conversion: { request_id: "test" } }),
}));
vi.mock("@/lib/lead-context", () => ({
  resolveLeadContext: async (input: Record<string, unknown>) => ({
    ...input,
    systemName: "Restaurant",
    sectorSlug: null,
    sectorLabel: null,
  }),
}));
vi.mock("@/lib/lead-notifications", () => ({
  submitLeadRequest: async (input: Record<string, unknown>) => {
    mocks.submitted.push(input);
    return { leadId: "lead-1" };
  },
}));

import { POST } from "@/app/api/systeme-kit/notify/route";

function request(payload: unknown) {
  return new Request("https://demaa.fr/api/systeme-kit/notify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

describe("system guide notification route", () => {
  beforeEach(() => {
    mocks.rateLimits.length = 0;
    mocks.submitted.length = 0;
  });

  it("stores a release-only notification for a future Restaurant guide", async () => {
    const response = await POST(
      request({
        email: "dirigeant@example.com",
        resourceSlug: "guide-comment-ouvrir-un-restaurant",
        systemSlug: "restaurant",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.rateLimits.map(({ keyPrefix }) => keyPrefix)).toEqual([
      "guide-notify-ip",
      "guide-notify-email",
    ]);
    expect(mocks.submitted[0]).toMatchObject({
      channels: { email: false, resend: false, slack: false },
      contact: { email: "dirigeant@example.com", firstName: null },
      context: {
        source: "Notification de sortie - Comment ouvrir un restaurant ?",
        systemSlug: "restaurant",
      },
      marketingConsent: {
        granted: false,
        text: "Notification de sortie du guide uniquement.",
        version: "guide-notify-v1",
      },
      requestType: "guide_release_notification",
    });
  });

  it("rejects an available guide and a future guide outside its system", async () => {
    const availableResponse = await POST(
      request({
        email: "dirigeant@example.com",
        resourceSlug: "guide-facturation-electronique",
        systemSlug: "restaurant",
      }),
    );
    const wrongSystemResponse = await POST(
      request({
        email: "dirigeant@example.com",
        resourceSlug: "guide-comment-gerer-un-restaurant",
        systemSlug: "cabinet-comptable",
      }),
    );

    expect(availableResponse.status).toBe(404);
    expect(wrongSystemResponse.status).toBe(404);
    expect(mocks.submitted).toHaveLength(0);
  });

  it("silently accepts the honeypot without storing a notification", async () => {
    const response = await POST(
      request({
        email: "robot@example.com",
        resourceSlug: "guide-comment-gerer-un-restaurant",
        systemSlug: "restaurant",
        website: "https://spam.invalid",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.submitted).toHaveLength(0);
  });
});
