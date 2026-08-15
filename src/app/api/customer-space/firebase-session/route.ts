import { NextResponse } from "next/server";
import { enforceRateLimit, normalizeText, readJsonBody } from "@/lib/api-security";
import {
  CUSTOMER_SPACE_COOKIE,
  createCustomerSession,
  getCustomerCookieOptions,
} from "@/lib/customer-space-auth";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

type FirebaseSessionBody = {
  idToken?: unknown;
  returnTo?: unknown;
};

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;

  const limited = await enforceRateLimit(request, {
    keyPrefix: "customer-firebase-session",
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const { data: body, response: invalidBodyResponse } =
    await readJsonBody<FirebaseSessionBody>(request, 16 * 1024);
  if (invalidBodyResponse) return invalidBodyResponse;

  const idToken = normalizeText(body?.idToken, 12_000);
  const returnTo = getSafeCustomerReturnTo(normalizeText(body?.returnTo, 200));
  if (!idToken) {
    return NextResponse.json(
      { error: "Le jeton de connexion est manquant." },
      { status: 400, headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  }

  let session: Awaited<ReturnType<typeof createCustomerSession>>;
  try {
    session = await createCustomerSession(idToken);
  } catch (error) {
    console.error(
      "[customer-firebase-session] session creation failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "La connexion a expiré. Réessayez." },
      { status: 401, headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  }
  if (!session) {
    return NextResponse.json(
      { error: "Cette méthode de connexion n’est pas autorisée." },
      { status: 401, headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  }

  const response = NextResponse.json(
    { redirectTo: returnTo },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
  response.cookies.set(
    CUSTOMER_SPACE_COOKIE,
    session.sessionCookie,
    getCustomerCookieOptions(),
  );
  return response;
}
