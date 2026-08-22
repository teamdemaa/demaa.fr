import { afterEach, describe, expect, it, vi } from "vitest";
import {
  readGuestActionPlan,
  resumeGuestActionPlanGeneration,
  startGuestActionPlanGeneration,
} from "@/lib/guest-action-plan.client";

const access = {
  accessKey: "A".repeat(43),
  expiresAt: "2026-08-23T10:00:00.000Z",
  generationId: `gpl_${"B".repeat(40)}`,
};

const generating = {
  status: "generating",
  generationId: access.generationId,
  expiresAt: access.expiresAt,
};

afterEach(() => vi.unstubAllGlobals());

describe("guest action-plan browser client", () => {
  it("sends only the strict generation fields and never puts the secret in a URL", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => new Response(
      JSON.stringify(generating),
      {
        headers: { "Content-Type": "application/json" },
        status: 202,
      },
    ));
    vi.stubGlobal("fetch", fetchMock);

    await startGuestActionPlanGeneration({
      contentLocaleCode: "fr",
      createdAt: "2026-08-22T10:00:00.000Z",
      marketCodeAtCreation: "fr-fr",
      requestId: "plan:request-1234567890",
      situation: "Une situation suffisamment détaillée pour créer le plan.",
    }, access.accessKey);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/guest/action-plans/generate");
    expect(url).not.toContain(access.accessKey);
    expect(JSON.parse(String(init.body))).toEqual({
      accessKey: access.accessKey,
      contentLocaleCode: "fr",
      marketCodeAtCreation: "fr-fr",
      requestId: "plan:request-1234567890",
      situation: "Une situation suffisamment détaillée pour créer le plan.",
    });
    expect(String(init.body)).not.toContain("createdAt");
  });

  it("uses the bearer header for reads and retries without leaking the secret", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => new Response(
      JSON.stringify(generating),
      {
        headers: { "Content-Type": "application/json" },
        status: 202,
      },
    ));
    vi.stubGlobal("fetch", fetchMock);

    await readGuestActionPlan(access);
    await resumeGuestActionPlanGeneration(access);

    for (const [url, init] of fetchMock.mock.calls as [string, RequestInit][]) {
      expect(url).not.toContain(access.accessKey);
      expect(init.headers).toEqual({ Authorization: `Bearer ${access.accessKey}` });
    }
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`/api/guest/action-plans/${access.generationId}`);
    expect(fetchMock.mock.calls[1]?.[0]).toBe(`/api/guest/action-plans/${access.generationId}/generation`);
  });
});
