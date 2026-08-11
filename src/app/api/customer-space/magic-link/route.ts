import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import {
  getMagicLinkErrorMessage,
  sendCustomerMagicLinkEmail,
} from "@/lib/customer-space-email";
import { InvalidActionPlanClaimError } from "@/lib/customer-space-auth";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";
import { ACTION_PLAN_ACCESS_COOKIE } from "@/lib/action-plan-storage.server";

export const runtime = "nodejs";

function noStore<T extends Response>(response: T) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

type MagicLinkRequestBody = {
  actionPlanClaimSecret?: unknown;
  actionPlanId?: unknown;
  email?: unknown;
  returnTo?: unknown;
};

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return noStore(blockedHost);
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return noStore(blockedOrigin);

  const { data: body, response } =
    await readJsonBody<MagicLinkRequestBody>(request, 4 * 1024);
  if (response) return noStore(response);

  const email = normalizeEmail(normalizeText(body?.email, 160));
  const returnTo = getSafeCustomerReturnTo(normalizeText(body?.returnTo, 200));
  const actionPlanId = normalizeText(body?.actionPlanId, 40);
  const actionPlanClaimSecret = normalizeText(body?.actionPlanClaimSecret, 80);
  const cookieStore = await cookies();
  const temporaryAccessToken = normalizeText(
    cookieStore.get(ACTION_PLAN_ACCESS_COOKIE)?.value,
    80,
  );
  const hasActionPlanClaim = Boolean(actionPlanId);

  if (
    (actionPlanClaimSecret && !actionPlanId) ||
    (hasActionPlanClaim &&
      (!/^[A-Za-z0-9_-]{12,40}$/.test(actionPlanId) ||
        (!temporaryAccessToken &&
          !/^[A-Za-z0-9_-]{32,80}$/.test(actionPlanClaimSecret))))
  ) {
    return noStore(NextResponse.json(
      { error: "La demande de sauvegarde n'est plus valide." },
      { status: 400 },
    ));
  }

  if (!email || !isValidEmail(email)) {
    return noStore(NextResponse.json(
      { error: "Merci d'indiquer une adresse email valide." },
      { status: 400 }
    ));
  }

  const limited = await enforceRateLimit(
    request,
    {
      keyPrefix: "customer-magic-link",
      limit: 3,
      windowMs: 15 * 60 * 1000,
    },
    email
  );
  if (limited) return noStore(limited);

  let emailResult: Awaited<ReturnType<typeof sendCustomerMagicLinkEmail>>;

  try {
    emailResult = await sendCustomerMagicLinkEmail({
      actionPlanClaim: hasActionPlanClaim
        ? {
            actionPlanId,
            claimSecret: actionPlanClaimSecret || null,
            temporaryAccessToken: temporaryAccessToken || null,
          }
        : null,
      email,
      request,
      returnTo,
    });
  } catch (error) {
    if (error instanceof InvalidActionPlanClaimError) {
      return noStore(NextResponse.json(
        { error: "Ce plan ne peut plus être sauvegardé. Merci de réessayer." },
        { status: 409 },
      ));
    }

    throw error;
  }

  if (!emailResult.sent) {
    return noStore(NextResponse.json(
      {
        error: getMagicLinkErrorMessage(emailResult.reason),
        sent: false,
        devLink: process.env.NODE_ENV === "production" ? null : emailResult.magicLink,
      },
      { status: 502 }
    ));
  }

  return noStore(NextResponse.json({
    sent: emailResult.sent,
    devLink: process.env.NODE_ENV === "production" ? null : emailResult.magicLink,
  }));
}
