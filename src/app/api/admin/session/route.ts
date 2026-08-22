import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_MS,
  getAdminCookieOptions,
  getCurrentAdminIdentity,
  isAdminIdentity,
} from "@/lib/admin-auth.server";
import { getSafeAdminReturnTo } from "@/lib/admin-auth-redirect";
import { enforceRateLimit, normalizeText, readJsonBody } from "@/lib/api-security";
import {
  createFirebaseSessionCookie,
  verifyFreshFirebaseIdentity,
} from "@/lib/customer-space-auth";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  Vary: "Cookie",
} as const;

type SessionBody = {
  idToken?: unknown;
  returnTo?: unknown;
};

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;

  const limited = await enforceRateLimit(request, {
    keyPrefix: "admin-auth-session",
    limit: 12,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const { data: body, response: invalidBodyResponse } =
    await readJsonBody<SessionBody>(request, 16 * 1024);
  if (invalidBodyResponse) return invalidBodyResponse;

  const idToken = normalizeText(body?.idToken, 12_000);
  const returnTo = getSafeAdminReturnTo(normalizeText(body?.returnTo, 200));
  if (!idToken) {
    return NextResponse.json(
      { error: "Le jeton de connexion est manquant." },
      { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  let identity: Awaited<ReturnType<typeof verifyFreshFirebaseIdentity>>;
  try {
    identity = await verifyFreshFirebaseIdentity(idToken);
  } catch (error) {
    console.error(
      "[admin-auth-session] Firebase session creation failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "La connexion Team a expiré. Réessayez." },
      { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  if (!identity) {
    return NextResponse.json(
      { error: "Cette méthode de connexion n’est pas autorisée." },
      { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
  if (!isAdminIdentity(identity)) {
    return NextResponse.json(
      { code: "admin_access_denied", error: "Ce compte ne fait pas partie de la Team Demaa." },
      { status: 403, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  let sessionCookie: string;
  try {
    sessionCookie = await createFirebaseSessionCookie(
      idToken,
      ADMIN_SESSION_TTL_MS,
    );
  } catch (error) {
    console.error(
      "[admin-auth-session] Firebase session cookie creation failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "La connexion Team a expiré. Réessayez." },
      { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  const response = NextResponse.json(
    { redirectTo: returnTo },
    { headers: PRIVATE_NO_STORE_HEADERS },
  );
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    sessionCookie,
    getAdminCookieOptions(),
  );
  return response;
}

export async function GET() {
  const identity = await getCurrentAdminIdentity();
  return NextResponse.json(
    identity
      ? {
          authenticated: true,
          email: identity.email,
          provider: identity.provider,
          uid: identity.uid,
        }
      : { authenticated: false, email: null, provider: null, uid: null },
    { headers: PRIVATE_NO_STORE_HEADERS },
  );
}

export async function DELETE(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;

  const response = NextResponse.json(
    { signedOut: true },
    { headers: PRIVATE_NO_STORE_HEADERS },
  );
  response.cookies.set(ADMIN_SESSION_COOKIE, "", getAdminCookieOptions(0));
  return response;
}
