import { getAuth } from "firebase-admin/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import {
  ACTION_PLAN_ACCESS_COOKIE,
  claimPendingActionPlanWithAccessToken,
} from "@/lib/action-plan-storage.server";
import {
  CUSTOMER_SPACE_COOKIE,
  createCustomerSession,
  getCustomerCookieOptions,
} from "@/lib/customer-space-auth";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";
import { normalizeEmail } from "@/lib/email";
import { getFirebaseAdminApp } from "@/lib/firebase-admin";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

type GoogleSessionBody = {
  actionPlanId?: unknown;
  idToken?: unknown;
  returnTo?: unknown;
};

export async function POST(request: NextRequest) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;

  const limited = await enforceRateLimit(request, {
    keyPrefix: "customer-google-session",
    limit: 15,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const { data: body, response: invalidBodyResponse } =
    await readJsonBody<GoogleSessionBody>(request, 16 * 1024);
  if (invalidBodyResponse) return invalidBodyResponse;

  const idToken = normalizeText(body?.idToken, 12_000);
  const actionPlanId = normalizeText(body?.actionPlanId, 80);
  const returnTo = getSafeCustomerReturnTo(normalizeText(body?.returnTo, 200));

  if (!idToken) {
    return NextResponse.json(
      { error: "Le jeton Google est manquant." },
      { status: 400, headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  }

  let email: string;
  try {
    const decoded = await getAuth(getFirebaseAdminApp()).verifyIdToken(idToken, true);
    if (!decoded.email || decoded.email_verified !== true) {
      return NextResponse.json(
        { error: "Google n’a pas confirmé cette adresse e-mail." },
        { status: 401, headers: { "Cache-Control": "private, no-store, max-age=0" } },
      );
    }
    email = normalizeEmail(decoded.email);
  } catch {
    return NextResponse.json(
      { error: "La connexion Google a expiré. Réessayez." },
      { status: 401, headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  }

  let claimedPendingPlan = false;
  if (actionPlanId) {
    const temporaryAccessToken = request.cookies.get(ACTION_PLAN_ACCESS_COOKIE)?.value;
    const claimed = temporaryAccessToken
      ? await claimPendingActionPlanWithAccessToken({
          email,
          id: actionPlanId,
          temporaryAccessToken,
        })
      : false;

    if (!claimed) {
      return NextResponse.json(
        { error: "Ce plan temporaire n’est plus disponible. Enregistrez-le à nouveau." },
        { status: 409, headers: { "Cache-Control": "private, no-store, max-age=0" } },
      );
    }
    claimedPendingPlan = true;
  }

  const sessionToken = await createCustomerSession(email);
  const response = NextResponse.json(
    { redirectTo: returnTo },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
  response.cookies.set(
    CUSTOMER_SPACE_COOKIE,
    sessionToken,
    getCustomerCookieOptions(),
  );
  if (claimedPendingPlan) {
    response.cookies.delete(ACTION_PLAN_ACCESS_COOKIE);
  }
  return response;
}
