import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  blockedResponse: null as Response | null,
  destination: "https://docs.google.com/spreadsheets/d/example/copy" as string | null,
  limitedResponse: null as Response | null,
}));

vi.mock("@/lib/api-security", () => ({
  enforceRateLimit: vi.fn(async () => mocks.limitedResponse),
}));
vi.mock("@/lib/copyable-model-assets.server", () => ({
  getCopyableModelDestination: vi.fn(() => mocks.destination),
}));
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: vi.fn(() => mocks.blockedResponse),
}));
vi.mock("@/lib/site-url", () => ({
  getCanonicalOrigin: () => "https://demaa.co",
}));

import { GET } from "@/app/api/modeles/[slug]/copier/route";

function callRoute(slug = "suivi-previsionnel-financier") {
  return GET(
    new Request(`https://demaa.co/api/modeles/${slug}/copier`),
    { params: Promise.resolve({ slug }) },
  );
}

describe("copyable model open route", () => {
  beforeEach(() => {
    mocks.blockedResponse = null;
    mocks.destination = "https://docs.google.com/spreadsheets/d/example/copy";
    mocks.limitedResponse = null;
  });

  it("redirects an available model to its resolved copy destination", async () => {
    const response = await callRoute();

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(mocks.destination);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
  });

  it("falls back to the public catalogue when no destination exists", async () => {
    mocks.destination = null;

    const response = await callRoute("modele-indisponible");

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://demaa.co/modeles");
  });

  it("returns host and rate-limit guards before resolving a destination", async () => {
    mocks.blockedResponse = Response.json({ error: "blocked" }, { status: 403 });
    expect((await callRoute()).status).toBe(403);

    mocks.blockedResponse = null;
    mocks.limitedResponse = Response.json({ error: "limited" }, { status: 429 });
    expect((await callRoute()).status).toBe(429);
  });
});
