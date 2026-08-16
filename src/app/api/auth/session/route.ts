import { NextResponse } from "next/server";
import { enforceRateLimit, normalizeText, readJsonBody } from "@/lib/api-security";
import {
  CUSTOMER_SPACE_COOKIE,
  createCustomerSession,
  getCustomerCookieOptions,
} from "@/lib/customer-space-auth";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";
import { getCurrentCustomerIdentityFromSession } from "@/lib/customer-space-session.server";
import {
  ensureDefaultCompanyForIdentity,
  getActiveDefaultCompanyIdentity,
} from "@/lib/company-membership.server";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
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
    keyPrefix: "customer-auth-session",
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const { data: body, response: invalidBodyResponse } =
    await readJsonBody<SessionBody>(request, 16 * 1024);
  if (invalidBodyResponse) return invalidBodyResponse;

  const idToken = normalizeText(body?.idToken, 12_000);
  const returnTo = getSafeCustomerReturnTo(normalizeText(body?.returnTo, 400));
  if (!idToken) {
    return NextResponse.json(
      { error: "Le jeton de connexion est manquant." },
      { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  let session: Awaited<ReturnType<typeof createCustomerSession>>;
  try {
    session = await createCustomerSession(idToken);
  } catch (error) {
    console.error(
      "[auth-session] Firebase session creation failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "La connexion a expiré. Réessayez." },
      { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  if (!session) {
    return NextResponse.json(
      { error: "Cette méthode de connexion n’est pas autorisée." },
      { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  try {
    await ensureDefaultCompanyForIdentity(session.identity);
  } catch (error) {
    console.error(
      "[auth-session] Company provisioning failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "Votre espace n’a pas pu être préparé. Réessayez dans un instant." },
      { status: 503, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  const response = NextResponse.json(
    { redirectTo: returnTo },
    { headers: PRIVATE_NO_STORE_HEADERS },
  );
  response.cookies.set(
    CUSTOMER_SPACE_COOKIE,
    session.sessionCookie,
    getCustomerCookieOptions(),
  );
  return response;
}

export async function GET() {
  const identity = await getCurrentCustomerIdentityFromSession();
  if (!identity) {
    return NextResponse.json(
      { authenticated: false, companyReady: false, email: null, provider: null, uid: null },
      { headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  try {
    const existingCompany = await getActiveDefaultCompanyIdentity(identity.uid);
    if (!existingCompany) await ensureDefaultCompanyForIdentity(identity);
  } catch (error) {
    console.error(
      "[auth-session] Company context unavailable",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      {
        authenticated: true,
        companyReady: false,
        email: identity.email,
        provider: identity.provider,
        uid: identity.uid,
        error: "company_context_unavailable",
      },
      { status: 409, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      companyReady: true,
      email: identity.email,
      provider: identity.provider,
      uid: identity.uid,
    },
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
  response.cookies.set(CUSTOMER_SPACE_COOKIE, "", getCustomerCookieOptions(0));
  return response;
}
