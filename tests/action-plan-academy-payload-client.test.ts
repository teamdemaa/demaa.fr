import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getActionPlanAcademyPayloadCacheKey,
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
const frenchAcademyContext = {
  localeCode: "fr",
  marketCode: "fr-fr",
} as const;
const frenchAcademyCacheKey = getActionPlanAcademyPayloadCacheKey(
  frenchAcademyContext.localeCode,
  frenchAcademyContext.marketCode,
);

function jsonResponse(body: unknown, ok = true) {
  return {
    json: vi.fn().mockResolvedValue(body),
    ok,
  } as unknown as Response;
}

describe("action plan Academy client payload cache", () => {
  beforeEach(() => {
    invalidateActionPlanAcademyPayload(frenchAcademyCacheKey);
    invalidateActionPlanAcademyPayload(
      getActionPlanAcademyPayloadCacheKey("en", "global-en-beta"),
    );
    vi.restoreAllMocks();
  });

  it("shares the same Promise and request between simultaneous loads", async () => {
    let resolveResponse: ((response: Response) => void) | undefined;
    const fetchMock = vi.fn().mockImplementation(() => new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    }));
    vi.stubGlobal("fetch", fetchMock);

    const first = loadActionPlanAcademyPayload(frenchAcademyContext);
    const second = loadActionPlanAcademyPayload(frenchAcademyContext);

    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveResponse?.(jsonResponse(academyPayload));
    await expect(first).resolves.toEqual(academyPayload);
    await expect(second).resolves.toEqual(academyPayload);
  });

  it("serves two successive openings from one fetch", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(academyPayload));
    vi.stubGlobal("fetch", fetchMock);

    await loadActionPlanAcademyPayload(frenchAcademyContext);
    await loadActionPlanAcademyPayload(frenchAcademyContext);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(readCachedActionPlanAcademyPayload(frenchAcademyCacheKey)).toEqual(academyPayload);
  });

  it("exposes the cached payload synchronously for a remount", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(academyPayload)));

    await loadActionPlanAcademyPayload(frenchAcademyContext);

    expect(readCachedActionPlanAcademyPayload(frenchAcademyCacheKey)).toBe(academyPayload);
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

    await loadActionPlanAcademyPayload(frenchAcademyContext);
    invalidateActionPlanAcademyPayload(frenchAcademyCacheKey);
    expect(readCachedActionPlanAcademyPayload(frenchAcademyCacheKey)).toBeNull();

    await expect(loadActionPlanAcademyPayload(frenchAcademyContext))
      .resolves.toEqual(refreshedPayload);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(readCachedActionPlanAcademyPayload(frenchAcademyCacheKey))
      .toEqual(refreshedPayload);
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

    const staleRequest = loadActionPlanAcademyPayload(frenchAcademyContext);
    invalidateActionPlanAcademyPayload(frenchAcademyCacheKey);
    await loadActionPlanAcademyPayload(frenchAcademyContext);
    resolveStale?.(jsonResponse(academyPayload));
    await staleRequest;

    expect(readCachedActionPlanAcademyPayload(frenchAcademyCacheKey)).toEqual(freshPayload);
  });

  it("rejects incomplete payloads without caching them", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ contents: [] })));

    await expect(loadActionPlanAcademyPayload(frenchAcademyContext)).rejects.toThrow(
      "Impossible de charger l’Académie.",
    );
    expect(readCachedActionPlanAcademyPayload(frenchAcademyCacheKey)).toBeNull();
  });

  it("isolates English and French Academy payloads and requests", async () => {
    const frenchPayload = { contents: [{ identity: { slug: "fr" } }], liveTrainings: [] };
    const englishPayload = { contents: [{ identity: { slug: "en" } }], liveTrainings: [] };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(frenchPayload))
      .mockResolvedValueOnce(jsonResponse(englishPayload));
    vi.stubGlobal("fetch", fetchMock);

    await loadActionPlanAcademyPayload(frenchAcademyContext);
    await loadActionPlanAcademyPayload({
      localeCode: "en",
      marketCode: "global-en-beta",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/action-plan/academy?locale=fr&market=fr-fr",
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/action-plan/academy?locale=en&market=global-en-beta",
    );
    expect(readCachedActionPlanAcademyPayload(frenchAcademyCacheKey)).toEqual(frenchPayload);
    expect(readCachedActionPlanAcademyPayload(
      getActionPlanAcademyPayloadCacheKey("en", "global-en-beta"),
    )).toEqual(englishPayload);
    expect(getActionPlanAcademyPayloadCacheKey("en", "fr-fr"))
      .not.toBe(getActionPlanAcademyPayloadCacheKey("en", "global-en-beta"));
  });

  it("reports English Academy load failures in English", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ contents: [] })));

    await expect(loadActionPlanAcademyPayload({
      localeCode: "en",
      marketCode: "global-en-beta",
    })).rejects.toThrow("Unable to load the Academy.");
  });
});

describe("action plan System payload cache regression", () => {
  it("isolates cached payloads by locale and market", () => {
    expect(getActionPlanSystemPayloadCacheKey("saas", false, "fr", "fr-fr"))
      .not.toBe(getActionPlanSystemPayloadCacheKey("saas", false, "en", "global-en-beta"));
    expect(getActionPlanSystemPayloadCacheKey("saas", false, "en", "fr-fr"))
      .not.toBe(getActionPlanSystemPayloadCacheKey("saas", false, "en", "global-en-beta"));
  });

  it("keeps deduplicating requests and exposing the cached System payload", async () => {
    const cacheKey = "test:academy-regression";
    const systemPayload = { system: { id: "test" } };
    invalidateActionPlanSystemPayload(cacheKey);
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(systemPayload));
    vi.stubGlobal("fetch", fetchMock);

    await Promise.all([
      loadActionPlanSystemPayload({
        cacheKey,
        demoMode: false,
        localeCode: "fr",
        marketCode: "fr-fr",
        systemId: "test",
      }),
      loadActionPlanSystemPayload({
        cacheKey,
        demoMode: false,
        localeCode: "fr",
        marketCode: "fr-fr",
        systemId: "test",
      }),
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
