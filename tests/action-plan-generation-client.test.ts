import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ActionPlanAuthenticationRequiredError,
  resumeAuthenticatedActionPlanGeneration,
  runExistingBlankActionPlanGeneration,
  runAuthenticatedActionPlanGeneration,
  watchAuthenticatedActionPlanGeneration,
} from "@/lib/action-plan-generation.client";

const draft = {
  createdAt: "2026-08-15T20:00:00.000Z",
  requestId: "generation-request-1234",
  situation: "Je dois clarifier le pilotage commercial de mon entreprise.",
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("authenticated generation client", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("window", {
      clearTimeout: globalThis.clearTimeout,
      setTimeout: globalThis.setTimeout,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("opens the persisted plan returned by the initial command", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, {
      status: "active",
      actionPlanId: "apl_active",
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(runAuthenticatedActionPlanGeneration(
      draft,
      new AbortController().signal,
    )).resolves.toBe("apl_active");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/action-plans/generate");
  });

  it("keeps the content locale independent from the company market", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, {
      status: "active",
      actionPlanId: "apl_english_france",
    }));
    vi.stubGlobal("fetch", fetchMock);

    await runAuthenticatedActionPlanGeneration({
      ...draft,
      contentLocaleCode: "en",
      marketCodeAtCreation: "fr-fr",
    }, new AbortController().signal);

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(request.body))).toMatchObject({
      contentLocaleCode: "en",
      marketCodeAtCreation: "fr-fr",
    });
  });

  it("shares server progress through status polling without another generation", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(202, {
        status: "generating",
        actionPlanId: "apl_pending",
        leaseExpiresAt: "2099-01-01T00:00:00.000Z",
      }))
      .mockResolvedValueOnce(jsonResponse(200, {
        status: "active",
        actionPlanId: "apl_pending",
      }));
    vi.stubGlobal("fetch", fetchMock);

    const result = runAuthenticatedActionPlanGeneration(
      draft,
      new AbortController().signal,
    );
    await vi.advanceTimersByTimeAsync(1_500);
    await expect(result).resolves.toBe("apl_pending");
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "/api/action-plans/generate",
      "/api/action-plans/apl_pending/generation",
    ]);
  });

  it("reclaims an expired lease with the same idempotency request", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(202, {
        status: "generating",
        actionPlanId: "apl_pending",
        leaseExpiresAt: "2020-01-01T00:00:00.000Z",
      }))
      .mockResolvedValueOnce(jsonResponse(201, {
        status: "active",
        actionPlanId: "apl_pending",
      }));
    vi.stubGlobal("fetch", fetchMock);

    const result = runAuthenticatedActionPlanGeneration(
      draft,
      new AbortController().signal,
    );
    await vi.advanceTimersByTimeAsync(1_500);
    await expect(result).resolves.toBe("apl_pending");
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "/api/action-plans/generate",
      "/api/action-plans/generate",
    ]);
  });

  it("returns a dedicated error when the server session has expired", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(401, {
      error: "Authentification requise.",
    })));
    await expect(runAuthenticatedActionPlanGeneration(
      draft,
      new AbortController().signal,
    )).rejects.toBeInstanceOf(ActionPlanAuthenticationRequiredError);
  });

  it("resumes a persisted generation by plan ID without the original browser draft", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, {
      status: "active",
      actionPlanId: "apl_persisted",
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(resumeAuthenticatedActionPlanGeneration(
      "apl_persisted",
      new AbortController().signal,
    )).resolves.toBe("apl_persisted");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/action-plans/apl_persisted/generation",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("watches an active lease without consuming a resume request", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(202, {
        status: "generating",
        actionPlanId: "apl_persisted",
        leaseExpiresAt: "2099-01-01T00:00:00.000Z",
      }))
      .mockResolvedValueOnce(jsonResponse(200, {
        status: "active",
        actionPlanId: "apl_persisted",
      }));
    vi.stubGlobal("fetch", fetchMock);

    const result = watchAuthenticatedActionPlanGeneration(
      "apl_persisted",
      new AbortController().signal,
    );
    await vi.advanceTimersByTimeAsync(1_500);
    await expect(result).resolves.toBe("apl_persisted");
    expect(fetchMock.mock.calls).toEqual([
      ["/api/action-plans/apl_persisted/generation", expect.objectContaining({ cache: "no-store" })],
      ["/api/action-plans/apl_persisted/generation", expect.objectContaining({ cache: "no-store" })],
    ]);
  });

  it("generates an existing blank plan through one durable server command", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, {
      status: "active",
      actionPlanId: "saved-plan-id",
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(runExistingBlankActionPlanGeneration({
      expectedRevision: 3,
      id: "saved-plan-id",
      situation: draft.situation,
    }, new AbortController().signal)).resolves.toBe("saved-plan-id");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/action-plans/saved-plan-id/generate",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ expectedRevision: 3, situation: draft.situation }),
      }),
    );
  });
});
