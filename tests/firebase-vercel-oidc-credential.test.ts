import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@vercel/oidc", () => ({
  getVercelOidcToken: vi.fn(async () => "vercel-oidc-token"),
}));

type CredentialModule = typeof import("@/lib/firebase-vercel-oidc-credential.server");

let credentialModule: CredentialModule;

beforeAll(async () => {
  credentialModule = await import("@/lib/firebase-vercel-oidc-credential.server");
});

beforeEach(() => {
  process.env.FIREBASE_WORKLOAD_IDENTITY_PROVIDER =
    "//iam.googleapis.com/projects/123/locations/global/workloadIdentityPools/vercel/providers/demaa";
  process.env.FIREBASE_WORKLOAD_IDENTITY_SERVICE_ACCOUNT =
    "reader@example.iam.gserviceaccount.com";
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.FIREBASE_WORKLOAD_IDENTITY_PROVIDER;
  delete process.env.FIREBASE_WORKLOAD_IDENTITY_SERVICE_ACCOUNT;
});

describe("Firebase Vercel workload identity credential", () => {
  it("exchanges the Vercel identity for a short-lived Google token and caches it", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        access_token: "federated-token",
        expires_in: 3600,
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        accessToken: "service-account-token",
        expireTime: new Date(Date.now() + 60 * 60 * 1_000).toISOString(),
      }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const credential = credentialModule
      .createFirebaseVercelWorkloadIdentityCredential();
    const first = await credential.getAccessToken();
    const second = await credential.getAccessToken();

    expect(first.access_token).toBe("service-account-token");
    expect(first.expires_in).toBeGreaterThan(3_500);
    expect(second).toEqual(first);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const { getVercelOidcToken } = await import("@vercel/oidc");
    expect(getVercelOidcToken).toHaveBeenCalledWith({
      audience:
        "//iam.googleapis.com/projects/123/locations/global/workloadIdentityPools/vercel/providers/demaa",
    });
    expect(fetchMock.mock.calls[0][0]).toBe("https://sts.googleapis.com/v1/token");
    expect(String(fetchMock.mock.calls[1][0])).toContain(
      "reader%40example.iam.gserviceaccount.com:generateAccessToken",
    );
  });

  it("requires both workload identity settings", () => {
    expect(
      credentialModule.hasFirebaseVercelWorkloadIdentityConfiguration(),
    ).toBe(true);
    delete process.env.FIREBASE_WORKLOAD_IDENTITY_SERVICE_ACCOUNT;
    expect(
      credentialModule.hasFirebaseVercelWorkloadIdentityConfiguration(),
    ).toBe(false);
  });

  it("reports the safe Google STS diagnostic without exposing the token", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({
      error: "invalid_grant",
      error_description: "The given credential is rejected by the attribute condition.",
    }), { status: 400 })));

    const credential = credentialModule
      .createFirebaseVercelWorkloadIdentityCredential();

    await expect(credential.getAccessToken()).rejects.toThrow(
      "The given credential is rejected by the attribute condition.",
    );
  });

  it("exposes the short-lived identity through GoogleAuth for Firestore", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        access_token: "federated-token",
        expires_in: 3600,
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        accessToken: "service-account-token",
        expireTime: new Date(Date.now() + 60 * 60 * 1_000).toISOString(),
      }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const googleAuth = credentialModule
      .createFirebaseVercelWorkloadIdentityGoogleAuth();
    const authClient = await googleAuth.getClient();
    const token = await authClient.getAccessToken();

    expect(token.token).toBe("service-account-token");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
