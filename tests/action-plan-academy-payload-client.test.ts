import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  invalidateActionPlanAcademyPayload,
  loadActionPlanAcademyPayload,
  readCachedActionPlanAcademyPayload,
} from "@/lib/action-plan-academy-payload.client";
import {
  getActionPlanSystemPayloadCacheKey,
  invalidateActionPlanSystemPayload,
  loadActionPlanSystemPayload,
  readCachedActionPlanSystemPayload,
} from "@/lib/action-plan-system-payload.client";

const academyPayload = {
  contents: [],
  liveTrainings: [],
};

function jsonResponse(body: unknown, ok = true) {
  return {
    json: vi.fn().mockResolvedValue(body),
    ok,
  } as unknown as Response;
}

describe("action plan Academy client payload cache", () => {
  beforeEach(() => {
    invalidateActionPlanAcademyPayload();
    vi.restoreAllMocks();
  });

  it("shares the same Promise and request between simultaneous loads", async () => {
    let resolveResponse: ((response: Response) => void) | undefined;
    const fetchMock = vi.fn().mockImplementation(() => new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    }));
    vi.stubGlobal("fetch", fetchMock);

    const first = loadActionPlanAcademyPayload();
    const second = loadActionPlanAcademyPayload();

    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveResponse?.(jsonResponse(academyPayload));
    await expect(first).resolves.toEqual(academyPayload);
    await expect(second).resolves.toEqual(academyPayload);
  });

  it("serves two successive openings from one fetch", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(academyPayload));
    vi.stubGlobal("fetch", fetchMock);

    await loadActionPlanAcademyPayload();
    await loadActionPlanAcademyPayload();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(readCachedActionPlanAcademyPayload()).toEqual(academyPayload);
  });

  it("exposes the cached payload synchronously for a remount", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(academyPayload)));

    await loadActionPlanAcademyPayload();

    expect(readCachedActionPlanAcademyPayload()).toBe(academyPayload);
  });

  it("invalidates and reloads a fresh payload after Retry", async () => {
    const refreshedPayload = {
      contents: [],
      liveTrainings: [{ slug: "session-2" }],
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(academyPayload))
      .mockResolvedValueOnce(jsonResponse(refreshedPayload));
    vi.stubGlobal("fetch", fetchMock);

    await loadActionPlanAcademyPayload();
    invalidateActionPlanAcademyPayload();
    expect(readCachedActionPlanAcademyPayload()).toBeNull();

    await expect(loadActionPlanAcademyPayload()).resolves.toEqual(refreshedPayload);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(readCachedActionPlanAcademyPayload()).toEqual(refreshedPayload);
  });

  it("does not let an invalidated stale request overwrite the fresh cache", async () => {
    let resolveStale: ((response: Response) => void) | undefined;
    const freshPayload = { contents: [], liveTrainings: [{ slug: "fresh" }] };
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => new Promise<Response>((resolve) => {
        resolveStale = resolve;
      }))
      .mockResolvedValueOnce(jsonResponse(freshPayload));
    vi.stubGlobal("fetch", fetchMock);

    const staleRequest = loadActionPlanAcademyPayload();
    invalidateActionPlanAcademyPayload();
    await loadActionPlanAcademyPayload();
    resolveStale?.(jsonResponse(academyPayload));
    await staleRequest;

    expect(readCachedActionPlanAcademyPayload()).toEqual(freshPayload);
  });

  it("rejects incomplete payloads without caching them", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ contents: [] })));

    await expect(loadActionPlanAcademyPayload()).rejects.toThrow(
      "Impossible de charger l’Académie.",
    );
    expect(readCachedActionPlanAcademyPayload()).toBeNull();
  });
});

describe("action plan System payload cache regression", () => {
  it("isolates cached payloads by locale and market", () => {
    expect(getActionPlanSystemPayloadCacheKey("saas", false, "fr", "fr-fr"))
      .not.toBe(getActionPlanSystemPayloadCacheKey("saas", false, "en", "global-en-beta"));
  });

  it("keeps deduplicating requests and exposing the cached System payload", async () => {
    const cacheKey = "test:academy-regression";
    const systemPayload = { system: { id: "test" } };
    invalidateActionPlanSystemPayload(cacheKey);
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(systemPayload));
    vi.stubGlobal("fetch", fetchMock);

    await Promise.all([
      loadActionPlanSystemPayload({ cacheKey, demoMode: false, systemId: "test" }),
      loadActionPlanSystemPayload({ cacheKey, demoMode: false, systemId: "test" }),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(readCachedActionPlanSystemPayload(cacheKey)).toEqual(systemPayload);
    invalidateActionPlanSystemPayload(cacheKey);
  });

  it("forwards locale and market once while concurrent callers share the request", async () => {
    const cacheKey = getActionPlanSystemPayloadCacheKey(
      "saas",
      false,
      "en",
      "global-en-beta",
    );
    invalidateActionPlanSystemPayload(cacheKey);
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ system: { id: "saas" } }));
    vi.stubGlobal("fetch", fetchMock);

    await Promise.all([
      loadActionPlanSystemPayload({
        cacheKey,
        demoMode: false,
        localeCode: "en",
        marketCode: "global-en-beta",
        systemId: "saas",
      }),
      loadActionPlanSystemPayload({
        cacheKey,
        demoMode: false,
        localeCode: "en",
        marketCode: "global-en-beta",
        systemId: "saas",
      }),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/action-plan/system/saas?locale=en&market=global-en-beta",
    );
    invalidateActionPlanSystemPayload(cacheKey);
  });
});
