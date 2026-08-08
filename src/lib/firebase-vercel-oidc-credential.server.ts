import "server-only";

import { getVercelOidcToken } from "@vercel/oidc";
import type {
  Credential,
  GoogleOAuthAccessToken,
} from "firebase-admin/app";
import { GoogleAuth, OAuth2Client } from "google-auth-library";

const CLOUD_PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";
const TOKEN_EXCHANGE_GRANT = "urn:ietf:params:oauth:grant-type:token-exchange";
const ACCESS_TOKEN_TYPE = "urn:ietf:params:oauth:token-type:access_token";
const JWT_TOKEN_TYPE = "urn:ietf:params:oauth:token-type:jwt";
const REFRESH_MARGIN_MS = 5 * 60 * 1_000;

type CachedToken = Readonly<{
  token: GoogleOAuthAccessToken;
  expiresAt: number;
}>;

function requiredEnvironment(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for Firebase workload identity.`);
  return value;
}

async function exchangeForFederatedToken(
  oidcToken: string,
  provider: string,
) {
  const response = await fetch("https://sts.googleapis.com/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      audience: provider,
      grant_type: TOKEN_EXCHANGE_GRANT,
      requested_token_type: ACCESS_TOKEN_TYPE,
      scope: CLOUD_PLATFORM_SCOPE,
      subject_token: oidcToken,
      subject_token_type: JWT_TOKEN_TYPE,
    }),
  });
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null) as {
      error?: unknown;
      error_description?: unknown;
    } | null;
    const reason = typeof errorPayload?.error_description === "string"
      ? errorPayload.error_description.slice(0, 500)
      : typeof errorPayload?.error === "string"
        ? errorPayload.error.slice(0, 120)
        : "No diagnostic was returned.";
    throw new Error(
      `Google STS refused the Vercel identity (${response.status}): ${reason}`,
    );
  }
  const payload = await response.json() as {
    access_token?: unknown;
    expires_in?: unknown;
  };
  if (
    typeof payload.access_token !== "string" ||
    typeof payload.expires_in !== "number" ||
    payload.expires_in <= 0
  ) {
    throw new Error("Google STS returned an invalid access token.");
  }
  return payload.access_token;
}

async function impersonateServiceAccount(
  federatedToken: string,
  serviceAccount: string,
) {
  const response = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(serviceAccount)}:generateAccessToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${federatedToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope: [CLOUD_PLATFORM_SCOPE],
        lifetime: "3600s",
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`Google IAM refused service-account impersonation (${response.status}).`);
  }
  const payload = await response.json() as {
    accessToken?: unknown;
    expireTime?: unknown;
  };
  if (
    typeof payload.accessToken !== "string" ||
    typeof payload.expireTime !== "string" ||
    !Number.isFinite(Date.parse(payload.expireTime))
  ) {
    throw new Error("Google IAM returned an invalid service-account token.");
  }
  const expiresAt = Date.parse(payload.expireTime);
  return {
    token: {
      access_token: payload.accessToken,
      expires_in: Math.max(1, Math.floor((expiresAt - Date.now()) / 1_000)),
    },
    expiresAt,
  } satisfies CachedToken;
}

export function hasFirebaseVercelWorkloadIdentityConfiguration() {
  return Boolean(
    process.env.FIREBASE_WORKLOAD_IDENTITY_PROVIDER &&
    process.env.FIREBASE_WORKLOAD_IDENTITY_SERVICE_ACCOUNT,
  );
}

export function createFirebaseVercelWorkloadIdentityCredential(): Credential {
  let cached: CachedToken | null = null;

  return {
    async getAccessToken() {
      if (cached && cached.expiresAt - REFRESH_MARGIN_MS > Date.now()) {
        return cached.token;
      }
      const provider = requiredEnvironment("FIREBASE_WORKLOAD_IDENTITY_PROVIDER");
      const serviceAccount = requiredEnvironment(
        "FIREBASE_WORKLOAD_IDENTITY_SERVICE_ACCOUNT",
      );
      const oidcToken = await getVercelOidcToken({ audience: provider });
      const federatedToken = await exchangeForFederatedToken(oidcToken, provider);
      cached = await impersonateServiceAccount(federatedToken, serviceAccount);
      return cached.token;
    },
  };
}

export function createFirebaseVercelWorkloadIdentityGoogleAuth() {
  const credential = createFirebaseVercelWorkloadIdentityCredential();
  const authClient = new OAuth2Client({
    eagerRefreshThresholdMillis: REFRESH_MARGIN_MS,
  });

  authClient.refreshHandler = async () => {
    const token = await credential.getAccessToken();
    return {
      access_token: token.access_token,
      expiry_date: Date.now() + token.expires_in * 1_000,
    };
  };

  return new GoogleAuth({ authClient });
}
